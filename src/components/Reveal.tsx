import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
export function Reveal({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const progress = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(reduced => {
        if (!active || reduced) {
          return;
        }
        progress.setValue(0);
        animation = Animated.timing(progress, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
        animation.start();
      })
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      reduced => {
        if (reduced) {
          animation?.stop();
          progress.setValue(1);
        }
      },
    );
    return () => {
      active = false;
      animation?.stop();
      listener.remove();
    };
  }, [progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
