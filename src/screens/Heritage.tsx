import { useResponsive } from '../hooks/useResponsive';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ImageBackground,
  TextInput,
  ScrollView,
  Share,
} from 'react-native';
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParams } from '../navigation/types';
import {
  Header,
  Segment,
  Page,
  Button,
  Empty,
  Back,
  Icon,
} from '../components/UI';
import { styles as s, colors } from '../theme';
import stories from '../data/stories.json';
import glossary from '../data/glossary.json';
import { assets } from '../data/assets';
export function storyImage(title: string) {
  return assets[title] || assets['Stories Passed Through Generations'];
}
export function Heritage() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const [tab, setTab] = useState('Heritage');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string[]>([]);
  const [all, setAll] = useState(false);
  const filtered = glossary.filter(
    item =>
      (category === 'All' || item.tag === category) &&
      `${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <View style={s.screen}>
      <Header title="Heritage & Glossary" />
      <Page>
        <Segment
          items={['Heritage', 'Glossary']}
          value={tab}
          onChange={setTab}
        />
        {tab === 'Heritage' ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                navigation.navigate('Article', { id: stories[0].id })
              }
            >
              <ImageBackground
                source={storyImage(stories[0].title)}
                imageStyle={{ borderRadius: 20 }}
                style={{
                  height: 240,
                  justifyContent: 'space-between',
                  padding: 18,
                }}
              >
                <Text style={s.tag}>FEATURED STORY</Text>
                <View
                  style={{
                    backgroundColor: '#00000060',
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text style={[s.heading, { color: 'white', fontSize: 25 }]}>
                    {stories[0].title}
                  </Text>
                  <Text
                    numberOfLines={2}
                    style={{ color: 'white', lineHeight: 20, marginTop: 6 }}
                  >
                    {stories[0].body}
                  </Text>
                </View>
              </ImageBackground>
            </Pressable>
            <View style={s.between}>
              <Text style={s.section}>Cultural highlights</Text>
              <Pressable onPress={() => setAll(!all)}>
                <Text style={{ color: colors.blue }}>
                  {all ? 'Show less' : 'See all'}
                </Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {stories.slice(1, all ? 24 : 8).map(item => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    navigation.navigate('Article', { id: item.id })
                  }
                  style={[
                    s.card,
                    { width: 158, marginRight: 12, backgroundColor: '#EDEBE9' },
                  ]}
                >
                  <Image
                    source={storyImage(item.title)}
                    style={{ width: '100%', height: 100 }}
                  />
                  <View style={{ padding: 12, gap: 8 }}>
                    <Text style={s.label}>{item.tag}</Text>
                    <Text style={{ color: colors.ink, lineHeight: 20 }}>
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={s.section}>Stories & traditions</Text>
            {stories.slice(8).map(item => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate('Article', { id: item.id })}
                style={[s.card, s.row, { padding: 12 }]}
              >
                <Image
                  source={storyImage(item.title)}
                  style={{ width: 78, height: 90, borderRadius: 15 }}
                />
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={s.tag}>{item.tag}</Text>
                  <Text style={{ color: colors.ink, fontSize: 15 }}>
                    {item.title}
                  </Text>
                  <Text numberOfLines={2} style={s.muted}>
                    {item.body}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <TextInput
              accessibilityLabel="Search glossary"
              value={query}
              onChangeText={setQuery}
              placeholder="Search terms, traditions, people"
              placeholderTextColor={colors.muted}
              style={s.input}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All', ...new Set(glossary.map(item => item.tag))].map(item => (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    s.pill,
                    {
                      marginRight: 8,
                      backgroundColor: category === item ? '#DCE0ED' : 'white',
                    },
                  ]}
                >
                  <Text style={s.muted}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={s.label}>{filtered.length} TERMS</Text>
            {filtered.map(item => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: expanded.includes(item.id) }}
                key={item.id}
                onPress={() =>
                  setExpanded(
                    expanded.includes(item.id)
                      ? expanded.filter(id => id !== item.id)
                      : [...expanded, item.id],
                  )
                }
                style={[s.card, { padding: 16, gap: 14 }]}
              >
                <View style={s.between}>
                  <Text style={{ flex: 1, fontSize: 16, color: colors.ink }}>
                    {item.title}
                  </Text>
                  <Text style={s.tag}>{item.tag}</Text>
                  <Text>{expanded.includes(item.id) ? '⌃' : '⌄'}</Text>
                </View>
                {expanded.includes(item.id) && (
                  <Text
                    style={[
                      s.body,
                      {
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 14,
                      },
                    ]}
                  >
                    {item.body}
                  </Text>
                )}
              </Pressable>
            ))}
            {filtered.length === 0 && (
              <Empty
                title="No terms found"
                body="Try a broader word or another category."
                action={
                  <Button
                    title="Clear search"
                    secondary
                    onPress={() => {
                      setQuery('');
                      setCategory('All');
                    }}
                  />
                }
              />
            )}
          </>
        )}
      </Page>
    </View>
  );
}
export function Article({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Article'>) {
  const { heroHeight, spacing } = useResponsive();
  const item = stories.find(story => story.id === route.params.id)!;
  return (
    <View style={s.screen}>
      <ScrollView>
        <ImageBackground
          source={storyImage(item.title)}
          style={{ height: heroHeight }}
        >
          <Back
            onPress={() => navigation.goBack()}
            rightAction={
              <Pressable
                accessibilityLabel="Share story"
                onPress={() =>
                  Share.share({
                    message: `${item.title}\n\n${item.body}`,
                  }).catch(() => {})
                }
                style={{
                  padding: 12,
                  backgroundColor: 'white',
                  borderRadius: 30,
                }}
              >
                <Icon name="share" />
              </Pressable>
            }
          />
        </ImageBackground>
        <View style={[s.content, { padding: spacing, paddingBottom: 45 }]}>
          <Text style={s.tag}>{item.tag}</Text>
          <Text style={s.title}>{item.title}</Text>
          {item.body
            .split('\n')
            .filter(Boolean)
            .map((paragraph, i) => (
              <Text key={i} style={s.body}>
                {paragraph}
              </Text>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
