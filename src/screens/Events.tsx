import { useResponsive } from '../hooks/useResponsive';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { Header, Page, Button, Back, Empty } from '../components/UI';
import { useStore } from '../storage/Store';
import { styles as s, colors } from '../theme';
export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dateKey(d) === value;
}
export function Events() {
  const { width, spacing, largeText } = useResponsive();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { state } = useStore();
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(dateKey(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7 + i);
    return d;
  });
  const filtered = state.events
    .filter(item => item.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <View style={s.screen}>
      <Header title="Entertainment" eyebrow="YOUR PLANS" />
      <Page>
        <View style={s.between}>
          <Pressable onPress={() => setOffset(offset - 1)}>
            <Text style={{ padding: 8, color: colors.blue }}>‹ Previous</Text>
          </Pressable>
          <Text style={s.muted}>
            {days[0].toLocaleDateString('en', {
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          <Pressable onPress={() => setOffset(offset + 1)}>
            <Text style={{ padding: 8, color: colors.blue }}>Next ›</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 5 }}
        >
          {days.map(date => (
            <Pressable
              key={dateKey(date)}
              onPress={() => setSelected(dateKey(date))}
              style={[
                s.card,
                {
                  width: Math.max(
                    largeText ? 58 : 40,
                    (width - spacing * 2 - 30) / 7,
                  ),
                  paddingVertical: 12,
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 14,
                  backgroundColor:
                    selected === dateKey(date) ? colors.blue : 'white',
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 9,
                  color: selected === dateKey(date) ? 'white' : colors.muted,
                }}
              >
                {date
                  .toLocaleDateString('en', { weekday: 'short' })
                  .toUpperCase()}
              </Text>
              <Text
                style={{
                  color: selected === dateKey(date) ? 'white' : colors.ink,
                }}
              >
                {date.getDate()}
              </Text>
              <Text
                style={{
                  color: selected === dateKey(date) ? 'white' : colors.blue,
                }}
              >
                {state.events.some(item => item.date === dateKey(date))
                  ? '•'
                  : '·'}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={[s.between, { flexWrap: 'wrap' }]}>
          <Text style={s.heading}>
            {new Date(selected + 'T12:00:00').toLocaleDateString('en', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <Text style={s.muted}>{filtered.length} events</Text>
        </View>
        {filtered.length === 0 ? (
          <Empty
            title="No events today"
            body="Add your own plans here. No live event schedule has been connected."
            action={
              <Button
                title="Add a plan"
                onPress={() => navigation.navigate('Event', {})}
              />
            }
          />
        ) : (
          filtered.map(item => (
            <View
              key={item.id}
              style={[
                s.card,
                {
                  padding: 17,
                  gap: 13,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.blue,
                },
              ]}
            >
              <Text style={s.label}>YOUR PLAN · {item.time}</Text>
              <Text style={s.heading}>{item.title}</Text>
              <Text style={s.muted}>{item.venue}</Text>
              <Button
                secondary
                title="View Details"
                onPress={() => navigation.navigate('Event', { id: item.id })}
              />
            </View>
          ))
        )}
        {filtered.length > 0 && (
          <Button
            title="Add a plan"
            onPress={() => navigation.navigate('Event', {})}
          />
        )}
        <Text style={s.section}>All saved plans</Text>
        {state.events
          .filter(item => item.date !== selected)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(item => (
            <Pressable
              key={item.id}
              style={[s.card, { padding: 15, gap: 8 }]}
              onPress={() => navigation.navigate('Event', { id: item.id })}
            >
              <Text style={s.heading}>{item.title}</Text>
              <Text style={s.muted}>
                {item.date} · {item.time}
              </Text>
            </Pressable>
          ))}
      </Page>
    </View>
  );
}
export function EventEditor({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Event'>) {
  const { state, save } = useStore();
  const item = state.events.find(event => event.id === route.params.id);
  const [title, setTitle] = useState(item?.title || '');
  const [date, setDate] = useState(item?.date || '');
  const [time, setTime] = useState(item?.time || '');
  const [venue, setVenue] = useState(item?.venue || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (
      !title.trim() ||
      !validDate(date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
      Alert.alert(
        'Check your plan',
        'Enter a title, a valid date (YYYY-MM-DD) and time (HH:MM).',
      );
      return;
    }
    setBusy(true);
    const event = {
      id: item?.id || Date.now().toString(),
      title: title.trim(),
      date,
      time,
      venue: venue.trim(),
      notes: notes.trim(),
    };
    const success = await save({
      events: [
        ...state.events.filter(existing => existing.id !== event.id),
        event,
      ],
    });
    setBusy(false);
    if (success) {
      navigation.goBack();
    }
  }
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Back
        title={item ? 'Event details' : 'Add a plan'}
        onPress={() => navigation.goBack()}
      />
      <Page>
        <Text style={s.title}>
          {item ? 'Your event' : 'Plan your experience'}
        </Text>
        {[
          ['TITLE', title, setTitle, 'Event name'],
          ['DATE', date, setDate, 'YYYY-MM-DD'],
          ['TIME', time, setTime, 'HH:MM'],
          ['VENUE', venue, setVenue, 'Location'],
          ['NOTES', notes, setNotes, 'Your notes'],
        ].map(([label, value, setter, placeholder]) => (
          <View key={label as string} style={{ gap: 8 }}>
            <Text style={s.label}>{label as string}</Text>
            <TextInput
              accessibilityLabel={label as string}
              style={s.input}
              value={value as string}
              onChangeText={setter as (value: string) => void}
              placeholder={placeholder as string}
              placeholderTextColor={colors.muted}
              multiline={label === 'NOTES'}
              maxLength={label === 'NOTES' ? 2000 : 200}
            />
          </View>
        ))}
        <Text style={s.muted}>
          This saves a personal plan. Tickets and hotel charges are arranged
          directly with the venue.
        </Text>
        <Button title="Save plan" disabled={busy} onPress={submit} />
        {item && (
          <Button
            secondary
            title="Delete plan"
            onPress={() =>
              Alert.alert(
                'Delete this plan?',
                'It will be removed from this device.',
                [
                  { text: 'Keep', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      if (
                        await save({
                          events: state.events.filter(
                            event => event.id !== item.id,
                          ),
                        })
                      ) {
                        navigation.goBack();
                      }
                    },
                  },
                ],
              )
            }
          />
        )}
      </Page>
    </KeyboardAvoidingView>
  );
}
