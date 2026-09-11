import React, { useEffect, useState } from 'react';
import { View, Pressable, Text, Keyboard, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParams } from './types';
import { Heritage, Article } from '../screens/Heritage';
import { Stay, Room, Service, Request } from '../screens/Stay';
import { Chat } from '../screens/Chat';
import { Events, EventEditor } from '../screens/Events';
import { Explore, Place, MapScreen } from '../screens/Explore';
import { Icon } from '../components/UI';
import { Reveal } from '../components/Reveal';
import { useResponsive } from '../hooks/useResponsive';
import { colors } from '../theme';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator();
function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { compact } = useResponsive();
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboard(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboard(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (keyboard) {
    return null;
  }
  return (
    <View
      style={{
        marginBottom: Math.max(insets.bottom, 12),
        marginTop: 8,
        marginHorizontal: compact ? 8 : 14,
        backgroundColor: 'black',
        borderRadius: 27,
        padding: 6,
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={route.name === 'Chat' ? 'Q&A' : route.name}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!selected && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={{ flex: 1 }}
          >
            <View
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                minHeight: compact ? 52 : 58,
                alignItems: 'center',
                paddingVertical: compact ? 8 : 11,
                gap: 6,
              }}
            >
              <LinearGradient
                pointerEvents="none"
                colors={selected ? ['#5166A7', '#3D5089'] : ['#000', '#000']}
                style={StyleSheet.absoluteFill}
              />
              <Icon
                name={route.name}
                color={selected ? 'white' : '#969FA9'}
                size={21}
              />
              <Text
                numberOfLines={1}
                style={{ fontSize: 10, color: selected ? 'white' : '#969FA9' }}
              >
                {route.name === 'Chat' ? 'Q&A' : route.name}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
function Main() {
  return (
    <Tabs.Navigator
      tabBar={props => <TabBar {...props} />}
      screenLayout={({ children }) => (
        <Reveal style={{ flex: 1 }}>{children}</Reveal>
      )}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="Heritage" component={Heritage} />
      <Tabs.Screen name="Stay" component={Stay} />
      <Tabs.Screen name="Chat" component={Chat} />
      <Tabs.Screen name="Events" component={Events} />
      <Tabs.Screen name="Explore" component={Explore} />
    </Tabs.Navigator>
  );
}
export function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bg,
          primary: colors.blue,
        },
      }}
    >
      <Stack.Navigator
        screenLayout={({ children, route }) =>
          route.name === 'Main' ? (
            children
          ) : (
            <Reveal style={{ flex: 1 }}>{children}</Reveal>
          )
        }
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Article" component={Article} />
        <Stack.Screen name="Room" component={Room} />
        <Stack.Screen name="Service" component={Service} />
        <Stack.Screen name="Request" component={Request} />
        <Stack.Screen name="Place" component={Place} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Event" component={EventEditor} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
