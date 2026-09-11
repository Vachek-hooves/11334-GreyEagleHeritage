import { useResponsive } from '../hooks/useResponsive';
import { Reveal } from '../components/Reveal';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/UI';
import { styles as s, colors } from '../theme';
import { faq, answerQuestion } from '../data/faq';
import { useStore } from '../storage/Store';

export function Chat() {
  const { compact, spacing } = useResponsive();
  const { state, save } = useStore();
  const insets = useSafeAreaInsets();
  const [topic, setTopic] = useState('Hotel');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const answerY = useRef(0);
  const shouldScroll = useRef(false);
  const questions = faq.filter(item => item.topic === topic);
  const visibleQuestions = expanded ? questions : questions.slice(0, 3);
  async function send(question: string) {
    if (!question.trim() || busy) {
      return;
    }
    setBusy(true);
    const id = Date.now().toString();
    shouldScroll.current = true;
    const success = await save({
      messages: [
        ...state.messages,
        { id, role: 'user', text: question.trim() },
        { id: id + 'a', role: 'assistant', text: answerQuestion(question) },
      ],
    });
    if (success) {
      setText('');
      setExpanded(false);
    } else {
      shouldScroll.current = false;
    }
    setBusy(false);
  }
  function clear() {
    Alert.alert(
      'Clear conversation?',
      'This removes messages saved on this device.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (await save({ messages: [] })) {
              scroll.current?.scrollTo({ y: 0, animated: true });
            }
          },
        },
      ],
    );
  }
  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[c.header, { paddingTop: insets.top + (compact ? 6 : 12) }]}>
        <View
          style={[
            c.headerRow,
            { paddingHorizontal: spacing, marginBottom: compact ? 10 : 16 },
          ]}
        >
          <View style={c.headerIcon}>
            <Icon name="Chat" color="#91A4E0" size={23} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={c.title}>Ask Grey Eagle</Text>
            <Text style={c.subtitle}>Your resort & heritage guide</Text>
          </View>
          {state.messages.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear conversation"
              onPress={clear}
              hitSlop={8}
              style={c.clear}
            >
              <Text style={c.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={c.topics}
        >
          {['Hotel', 'Heritage', 'Dining', 'Entertainment', 'Explore'].map(
            item => (
              <Pressable
                key={item}
                accessibilityRole="button"
                accessibilityState={{ selected: topic === item }}
                onPress={() => {
                  setTopic(item);
                  setExpanded(false);
                  scroll.current?.scrollToEnd({ animated: true });
                }}
                style={[c.topic, topic === item && c.selectedTopic]}
              >
                <Text
                  style={[c.topicText, topic === item && c.selectedTopicText]}
                >
                  {item}
                </Text>
              </Pressable>
            ),
          )}
        </ScrollView>
      </View>
      <ScrollView
        ref={scroll}
        style={c.conversation}
        contentContainerStyle={[c.messages, { padding: spacing }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={[c.bubble, c.assistant]}>
          <Text style={c.message}>
            Welcome to Grey Eagle. Ask about your stay, cultural experiences or
            places nearby, or choose a question below.
          </Text>
        </View>
        {state.messages.map((message, index) => (
          <View
            key={message.id}
            onLayout={event => {
              if (index === state.messages.length - 1) {
                answerY.current = event.nativeEvent.layout.y;
                if (shouldScroll.current) {
                  scroll.current?.scrollTo({
                    y: Math.max(0, answerY.current - 12),
                    animated: true,
                  });
                  shouldScroll.current = false;
                }
              }
            }}
            style={[c.bubble, message.role === 'user' ? c.user : c.assistant]}
          >
            <Reveal>
              <Text
                selectable
                style={[c.message, message.role === 'user' && c.userText]}
              >
                {message.text}
              </Text>
            </Reveal>
          </View>
        ))}
        <View style={c.suggestions}>
          <View style={s.between}>
            <Text style={s.label}>SUGGESTED QUESTIONS</Text>
            <Text style={s.muted}>{questions.length} questions</Text>
          </View>
          {visibleQuestions.map(item => (
            <Pressable
              key={item.q}
              accessibilityRole="button"
              disabled={busy}
              onPress={() => send(item.q)}
              style={c.question}
            >
              <Text style={c.chevron}>›</Text>
              <Text style={c.questionText}>{item.q}</Text>
            </Pressable>
          ))}
          {questions.length > 3 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setExpanded(!expanded)}
              style={c.more}
            >
              <Text style={c.moreText}>
                {expanded
                  ? 'Show fewer questions'
                  : `View all ${questions.length} questions`}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
      <View style={c.composerArea}>
        <View style={c.composer}>
          <TextInput
            accessibilityLabel="Ask about your stay"
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => send(text)}
            returnKeyType="send"
            maxLength={1000}
            placeholder="Ask about your stay…"
            placeholderTextColor={colors.muted}
            style={c.input}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={busy || !text.trim()}
            onPress={() => send(text)}
            style={[c.send, { opacity: busy || !text.trim() ? 0.45 : 1 }]}
          >
            <Icon name="send" color="white" size={21} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
const c = StyleSheet.create({
  header: {
    backgroundColor: '#000',
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191F31',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  subtitle: { fontSize: 12, color: '#9AA4B9', lineHeight: 17 },
  clear: { paddingVertical: 10, paddingLeft: 8 },
  clearText: { fontSize: 12, color: '#A4B4DF' },
  topics: { paddingHorizontal: 20, gap: 8 },
  topic: {
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#16181F',
    borderWidth: 1,
    borderColor: '#2A2D38',
  },
  selectedTopic: { backgroundColor: '#4A5E9D', borderColor: '#6479B6' },
  topicText: { fontSize: 12, color: '#AFB5C3' },
  selectedTopicText: { color: '#FFF' },
  conversation: { flex: 1 },
  messages: { padding: 20, gap: 12, paddingBottom: 16 },
  bubble: { maxWidth: '90%', padding: 15, borderRadius: 19, borderWidth: 1 },
  assistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7E4E1',
    borderColor: '#DAD7D5',
    borderBottomLeftRadius: 5,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: colors.blue,
    borderColor: colors.blue,
    borderBottomRightRadius: 5,
  },
  message: { fontSize: 14, lineHeight: 22, color: colors.ink },
  userText: { color: '#FFF' },
  suggestions: { marginTop: 18, gap: 9 },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
  },
  chevron: { color: colors.blue, fontSize: 23 },
  questionText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.ink },
  more: { alignItems: 'center', padding: 12 },
  moreText: { fontSize: 13, color: colors.blue },
  composerArea: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: colors.bg,
    flexShrink: 0,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  send: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    borderRadius: 24,
  },
});
