import React from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../hooks/useResponsive';
import { colors, styles as s } from '../theme';
export function Icon({
  name,
  size = 22,
  color = colors.muted,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const paths: Record<string, string> = {
    Heritage: 'M2 18 8 8l4 7 4-11 6 14H2',
    Stay: 'M4 20V8h16v12M2 16h20M7 8V4h10v4',
    Chat: 'M4 4h16v13H9l-5 4V4',
    Events: 'M4 5h16v16H4V5M8 2v6M16 2v6M4 11h16',
    Explore:
      'M12 22S4 14 4 9a8 8 0 0 1 16 0c0 5-8 13-8 13ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    back: 'm14 6-6 6 6 6',
    search: 'M20 20l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14',
    check: 'm4 12 5 5L20 6',
    send: 'M12 20V4m-6 6 6-6 6 6',
    share: 'M12 16V2m-5 5 5-5 5 5M5 12v9h14v-9',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={paths[name] || paths.Stay}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        u.button,
        secondary && { borderWidth: 1, borderColor: '#B5BEDA' },
        { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 },
      ]}
    >
      <LinearGradient
        pointerEvents="none"
        colors={secondary ? ['#ECECF2', '#E8EAF2'] : ['#5064A2', '#34457B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text
        style={{
          color: secondary ? colors.blue : 'white',
          fontSize: 14,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Header({
  title,
  eyebrow = 'GREY EAGLE',
}: {
  title: string;
  eyebrow?: string;
}) {
  const insets = useSafeAreaInsets();
  const { compact, spacing } = useResponsive();
  return (
    <View
      style={{
        paddingTop: insets.top + (compact ? 10 : 18),
        paddingHorizontal: spacing,
        paddingBottom: compact ? 16 : 25,
        backgroundColor: 'black',
        borderBottomLeftRadius: 27,
        borderBottomRightRadius: 27,
      }}
    >
      <Text style={s.label}>{eyebrow}</Text>
      <Text
        style={[
          s.title,
          { color: 'white', marginTop: 8, fontSize: compact ? 25 : 29 },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}
export function Segment({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={u.segment}>
      {items.map(item => (
        <View key={item} style={{ flex: 1 }}>
          <Button
            title={item}
            secondary={value !== item}
            onPress={() => onChange(item)}
          />
        </View>
      ))}
    </View>
  );
}
export function Page({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { spacing } = useResponsive();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={[
        s.content,
        { padding: spacing, paddingBottom: Math.max(24, insets.bottom + 12) },
        style,
      ]}
    >
      {children}
    </ScrollView>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const { compact } = useResponsive();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: compact ? 28 : 55,
        gap: 18,
      }}
    >
      <View
        style={{ padding: 24, borderRadius: 55, backgroundColor: '#EAE9ED' }}
      >
        <Icon name="search" size={34} color={colors.blue} />
      </View>
      <Text style={s.heading}>{title}</Text>
      <Text style={[s.body, { textAlign: 'center', maxWidth: 280 }]}>
        {body}
      </Text>
      {action}
    </View>
  );
}
export function Back({
  onPress,
  title,
  rightAction,
}: {
  onPress: () => void;
  title?: string;
  rightAction?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { compact, spacing } = useResponsive();
  return (
    <View
      style={[
        s.row,
        { padding: spacing, paddingTop: insets.top + (compact ? 8 : 12) },
      ]}
    >
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={onPress}
        style={{ backgroundColor: '#ECEAE8', padding: 10, borderRadius: 30 }}
      >
        <Icon name="back" color={colors.ink} />
      </Pressable>
      {title && <Text style={[s.body, { flexShrink: 1 }]}>{title}</Text>}
      {rightAction && <View style={{ marginLeft: 'auto' }}>{rightAction}</View>}
    </View>
  );
}
const u = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 17,
    borderRadius: 17,
    minHeight: 48,
    overflow: 'hidden',
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
    borderRadius: 15,
    backgroundColor: '#EAE8E6',
    borderWidth: 1,
    borderColor: '#DAD8DC',
  },
});
