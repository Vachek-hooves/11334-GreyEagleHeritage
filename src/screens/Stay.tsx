import { useResponsive } from '../hooks/useResponsive';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { rooms, services } from '../data/rooms';
import { assets } from '../data/assets';
import { styles as s, colors } from '../theme';
import { Header, Segment, Page, Button, Back, Icon } from '../components/UI';
import { useStore } from '../storage/Store';
export function Stay() {
  const { compact, largeText } = useResponsive();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState('Rooms');
  const { state } = useStore();
  return (
    <View style={s.screen}>
      <Header title="Hotel & Services" eyebrow="GREY EAGLE RESORT" />
      <Page>
        <Segment items={['Rooms', 'Services']} value={tab} onChange={setTab} />
        {tab === 'Rooms' ? (
          <>
            {['Standard Rooms', 'Luxury Suites'].map((category, index) => (
              <View key={category} style={{ gap: 16 }}>
                <Text style={s.section}>{category}</Text>
                {rooms
                  .filter((_, i) => (index === 0 ? i < 3 : i >= 3))
                  .map(room => (
                    <View key={room.id} style={s.card}>
                      <Image
                        source={assets[room.title]}
                        style={{ height: 190, width: '100%' }}
                      />
                      <View style={{ padding: 15, gap: 12 }}>
                        <Text style={s.heading}>{room.title}</Text>
                        <Text numberOfLines={2} style={s.muted}>
                          {room.body}
                        </Text>
                        <Text style={s.muted}>
                          {room.bed} · {room.sleeps} guests · {room.size}
                        </Text>
                        <Button
                          secondary
                          title="View Details"
                          onPress={() =>
                            navigation.navigate('Room', { id: room.id })
                          }
                        />
                      </View>
                    </View>
                  ))}
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={s.muted}>
              Prepare and save your request, then share it with the front desk.
              Delivery and availability must be confirmed by the hotel.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {services.map(([name, description]) => (
                <Pressable
                  key={name}
                  onPress={() => navigation.navigate('Service', { name })}
                  style={[
                    s.card,
                    {
                      width: compact || largeText ? '100%' : '48%',
                      flexGrow: 1,
                      padding: 15,
                      minHeight: 155,
                      gap: 12,
                    },
                  ]}
                >
                  <View
                    style={{
                      backgroundColor: '#E3E6F0',
                      borderRadius: 10,
                      padding: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Icon name="Stay" color={colors.blue} />
                  </View>
                  <Text style={{ color: colors.ink }}>{name}</Text>
                  <Text style={s.muted}>{description}</Text>
                </Pressable>
              ))}
            </View>
            {state.requests.length > 0 && (
              <Text style={s.section}>Your requests</Text>
            )}
            {state.requests.map(item => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate('Request', { id: item.id })}
                style={[s.card, { padding: 16, gap: 6 }]}
              >
                <Text style={s.heading}>{item.service}</Text>
                <Text style={s.muted}>
                  Room {item.room} · {item.status}
                </Text>
              </Pressable>
            ))}
          </>
        )}
      </Page>
    </View>
  );
}
export function Room({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Room'>) {
  const { heroHeight, spacing, largeText } = useResponsive();
  const room = rooms.find(item => item.id === route.params.id)!;
  return (
    <View style={s.screen}>
      <ScrollView>
        <ImageBackground
          source={assets[room.title]}
          style={{ height: heroHeight }}
        >
          <Back onPress={() => navigation.goBack()} />
        </ImageBackground>
        <View style={[s.content, { padding: spacing }]}>
          <Text style={s.tag}>{room.tag}</Text>
          <Text style={s.title}>{room.title}</Text>
          <View
            style={[
              s.row,
              largeText && { flexDirection: 'column', alignItems: 'stretch' },
            ]}
          >
            {[
              [room.sleeps.toString(), 'SLEEPS'],
              [room.bed, 'BED'],
              [room.size, 'SIZE'],
            ].map(([value, label]) => (
              <View
                key={label}
                style={[
                  s.card,
                  { flex: 1, padding: 12, alignItems: 'center', gap: 5 },
                ]}
              >
                <Text style={{ textAlign: 'center', color: colors.ink }}>
                  {value}
                </Text>
                <Text style={s.label}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={s.body}>{room.body}</Text>
          <Text style={s.section}>Room features</Text>
          <View style={s.card}>
            {room.features.map(feature => (
              <Text
                key={feature}
                style={[
                  s.body,
                  {
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                • {feature}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
export function Service({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Service'>) {
  const { state, save } = useStore();
  const [room, setRoom] = useState(state.room);
  const [time, setTime] = useState('As soon as possible');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    if (!room.trim()) {
      Alert.alert('Room number required', 'Please enter your room number.');
      return;
    }
    setBusy(true);
    const id = `GE-${Date.now().toString(36).toUpperCase()}`;
    const success = await save({
      room: room.trim(),
      requests: [
        {
          id,
          service: route.params.name,
          room: room.trim(),
          time,
          comment: comment.trim(),
          created: new Date().toISOString(),
          status: 'Saved locally',
        },
        ...state.requests,
      ],
    });
    setBusy(false);
    if (success) {
      navigation.replace('Request', { id });
    }
  }
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Back title={route.params.name} onPress={() => navigation.goBack()} />
      <Page>
        <View style={[s.card, { padding: 18, gap: 8 }]}>
          <Text style={s.heading}>{route.params.name}</Text>
          <Text style={s.muted}>
            {services.find(item => item[0] === route.params.name)?.[1]}
          </Text>
        </View>
        <Text style={s.label}>PREFERRED TIME</Text>
        <View style={{ gap: 8 }}>
          {['As soon as possible', 'Within 2 hours', 'This evening'].map(
            value => (
              <Button
                key={value}
                title={value}
                secondary={time !== value}
                onPress={() => setTime(value)}
              />
            ),
          )}
        </View>
        <Text style={s.label}>ROOM NUMBER</Text>
        <TextInput
          value={room}
          onChangeText={setRoom}
          accessibilityLabel="Room number"
          placeholder="Enter your room number"
          placeholderTextColor={colors.muted}
          maxLength={12}
          style={s.input}
        />
        <Text style={s.label}>ADD A COMMENT</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={2000}
          placeholder="Anything we should know?"
          placeholderTextColor={colors.muted}
          style={[s.input, { height: 110, textAlignVertical: 'top' }]}
        />
        <Text style={s.muted}>
          Saving creates a request on this device. Share it with the front desk
          to arrange service.
        </Text>
        <Button title="Save Service Request" disabled={busy} onPress={submit} />
      </Page>
    </KeyboardAvoidingView>
  );
}
export function Request({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Request'>) {
  const { state, save } = useStore();
  const request = state.requests.find(item => item.id === route.params.id)!;
  const cancel = () =>
    Alert.alert(
      'Cancel this request?',
      'This changes your saved request only. If you shared it, contact the front desk to cancel the service.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel request',
          style: 'destructive',
          onPress: () => {
            save({
              requests: state.requests.map(item =>
                item.id === request.id
                  ? { ...item, status: 'Cancelled' }
                  : item,
              ),
            });
          },
        },
      ],
    );
  return (
    <View style={s.screen}>
      <Back onPress={() => navigation.goBack()} />
      <Page>
        <View style={{ alignItems: 'center', paddingTop: 35, gap: 20 }}>
          <View
            style={{
              padding: 24,
              borderRadius: 60,
              backgroundColor: '#DBEDE4',
            }}
          >
            <Icon name="check" color={colors.green} size={36} />
          </View>
          <Text style={s.title}>
            {request.status === 'Cancelled'
              ? 'Request cancelled'
              : 'Request saved'}
          </Text>
          <Text style={[s.body, { textAlign: 'center' }]}>
            Your {request.service.toLowerCase()} request for Room {request.room}{' '}
            is saved on this device.
          </Text>
        </View>
        <View style={[s.card, { padding: 18, gap: 14 }]}>
          {[
            ['Reference', request.id],
            ['Service', request.service],
            ['Preferred time', request.time],
            ['Status', request.status],
          ].map(([label, value]) => (
            <View style={s.between} key={label}>
              <Text style={s.muted}>{label}</Text>
              <Text style={{ color: colors.ink, flexShrink: 1 }}>{value}</Text>
            </View>
          ))}
          {request.comment !== '' && (
            <Text style={s.body}>{request.comment}</Text>
          )}
        </View>
        {request.status !== 'Cancelled' && (
          <Button
            title="Share with Front Desk"
            onPress={() => {
              Share.share({
                message: `Service request ${request.id}\n${request.service}\nRoom: ${request.room}\nTime: ${request.time}\n${request.comment}`,
              }).catch(() =>
                Alert.alert('Unable to share', 'Please try again.'),
              );
            }}
          />
        )}
        <Button
          title="Back to Services"
          secondary
          onPress={() => navigation.goBack()}
        />
        {request.status !== 'Cancelled' && (
          <Pressable
            onPress={cancel}
            style={{ padding: 15, alignItems: 'center' }}
          >
            <Text style={{ color: '#C65B54' }}>Cancel request</Text>
          </Pressable>
        )}
      </Page>
    </View>
  );
}
