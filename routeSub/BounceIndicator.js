import React, {useEffect, useRef, useMemo} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';

const DIAMOND_COUNT = 3;
const DIAMOND_MAX_SIZE = 76;
const DIAMOND_DURATION = 2000;
const DIAMOND_STAGGER = 650;

const CORE_SIZE = 16;
const CORE_DURATION = 850;

const BLUE = '#495D9C';
const GREEN = '#2A9870';

function createDiamondAnimation(progress) {
  return Animated.loop(
    Animated.timing(progress, {
      toValue: 1,
      duration: DIAMOND_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }),
  );
}

function createCoreAnimation(anim) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: CORE_DURATION,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: CORE_DURATION,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]),
  );
}

const Diamond = React.memo(({progress}) => {
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 0.35, 0],
  });

  return (
    <Animated.View
      style={[
        styles.diamond,
        {transform: [{rotate: '45deg'}, {scale}], opacity},
      ]}
    />
  );
});

const BounceIndicator = ({containerStyle}) => {
  const progresses = useRef(
    Array.from({length: DIAMOND_COUNT}, () => new Animated.Value(0)),
  ).current;
  const core = useRef(new Animated.Value(0)).current;

  const delays = useMemo(
    () => Array.from({length: DIAMOND_COUNT}, (_, i) => i * DIAMOND_STAGGER),
    [],
  );

  useEffect(() => {
    const anims = [];

    progresses.forEach((progress, i) => {
      const anim = createDiamondAnimation(progress);
      const timeout = setTimeout(() => anim.start(), delays[i]);
      anims.push({anim, timeout});
    });

    const coreAnim = createCoreAnimation(core);
    coreAnim.start();

    return () => {
      anims.forEach(({anim, timeout}) => {
        clearTimeout(timeout);
        anim.stop();
      });
      coreAnim.stop();
    };
  }, [progresses, core, delays]);

  const coreScale = core.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });
  const coreOpacity = core.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[styles.container, containerStyle]}>
      <View style={styles.diamondContainer}>
        {progresses.map((progress, i) => (
          <Diamond key={i} progress={progress} />
        ))}
      </View>
      <Animated.View
        style={[
          styles.core,
          {transform: [{scale: coreScale}], opacity: coreOpacity},
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  diamondContainer: {
    position: 'absolute',
    width: DIAMOND_MAX_SIZE,
    height: DIAMOND_MAX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamond: {
    position: 'absolute',
    width: DIAMOND_MAX_SIZE,
    height: DIAMOND_MAX_SIZE,
    borderWidth: 2,
    borderColor: BLUE,
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    backgroundColor: GREEN,
  },
});

export default React.memo(BounceIndicator);
