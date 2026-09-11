import { useResponsive } from '../hooks/useResponsive';
import { Reveal } from '../components/Reveal';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  ImageBackground,
  Image,
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assets } from '../data/assets';
import { Button } from '../components/UI';
import { styles as s } from '../theme';
import { useStore } from '../storage/Store';
const loadingDuration = 4000;
function loadingHtml(startedAt: number) {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>
html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}
.bar{height:3px;width:100%;background:#8498d4;transform:scaleX(0);transform-origin:left;border-radius:4px}
</style></head><body><div class="bar"></div><script>
const startedAt=${startedAt};
const bar=document.querySelector('.bar');
let ready=false;
function frame(){
const progress=Math.min(1,Math.max(0,(Date.now()-startedAt)/${loadingDuration}));
bar.style.transform='scaleX('+progress+')';
if(!ready){ready=true;requestAnimationFrame(function(){window.ReactNativeWebView.postMessage('ready')});}
if(progress<1){requestAnimationFrame(frame);}
}
requestAnimationFrame(frame);
</script></body></html>`;
}
export function Loader({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const [startedAt] = useState(Date.now);
  const [source] = useState(() => ({ html: loadingHtml(startedAt) }));
  const [webReady, setWebReady] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const elapsed = Date.now() - startedAt;
    progress.setValue(Math.min(1, elapsed / loadingDuration));
    const remaining = Math.max(0, loadingDuration - elapsed);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: remaining,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start();
    const timer = setTimeout(onDone, remaining);
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [onDone, progress, startedAt]);
  return (
    <ImageBackground
      source={assets.splashBackground}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Image
        source={assets.logoTransparent}
        resizeMode="contain"
        style={{ width: '94%', height: 140 }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: Math.max(insets.bottom, 16) + 32,
          width: '70%',
          height: 64,
        }}
      >
        <View
          style={{
            height: 3,
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.22)',
          }}
        >
          <Animated.View
            testID="immediate-loading-progress"
            style={{
              height: 3,
              backgroundColor: '#8498d4',
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { opacity: webReady ? 1 : 0 }]}
          >
            <WebView
              testID="loading-webview"
              source={source}
              javaScriptEnabled
              bounces={false}
              overScrollMode="never"
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              automaticallyAdjustContentInsets={false}
              contentInsetAdjustmentBehavior="never"
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={request =>
                request.url === 'about:blank'
              }
              onMessage={event => {
                if (event.nativeEvent.data === 'ready') {
                  setWebReady(true);
                }
              }}
              onError={() => setWebReady(false)}
              style={{ flex: 1, backgroundColor: 'transparent' }}
              containerStyle={{ flex: 1, backgroundColor: 'transparent' }}
              opaque={false}
            />
          </View>
        </View>
        <Text
          style={{
            marginTop: 14,
            textAlign: 'center',
            color: '#A2A8B8',
            fontSize: 10,
            letterSpacing: 2,
          }}
        >
          PREPARING YOUR STAY
        </Text>
      </View>
    </ImageBackground>
  );
}
const slides = [
  [
    'Discover the Heritage',
    'Stories, traditions and symbols of the Tsuut’ina Nation — discover the people, land and living culture behind the resort.',
  ],
  [
    'Stay & Explore',
    'Browse rooms, organize guest service requests, and find everything the resort offers — from your room to the foothills beyond it.',
  ],
  [
    'Plan Your Experience',
    'Cultural tours, terminology and answers to your questions — planned around the days you are here.',
  ],
];
export function Onboarding() {
  const { compact, spacing, largeText } = useResponsive();
  const [index, setIndex] = useState(0);
  const { save } = useStore();
  const inset = useSafeAreaInsets();
  const finish = () => {
    save({ onboarded: true });
  };
  return (
    <ImageBackground
      source={
        assets[
          ['onboardingHeritage', 'onboardingStay', 'onboardingExperience'][
            index
          ]
        ]
      }
      style={{ flex: 1 }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={finish}
        style={{
          position: 'absolute',
          right: 20,
          top: inset.top + 15,
          padding: 15,
          zIndex: 1,
          backgroundColor: '#152334',
          borderRadius: 25,
        }}
      >
        <Text style={{ color: 'white' }}>Skip</Text>
      </Pressable>
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          padding: spacing,
          paddingTop: inset.top + 90,
          paddingBottom: Math.max(inset.bottom, 20) + 16,
        }}
      >
        <Reveal key={index}>
          <Text
            style={[s.title, { color: 'white', fontSize: compact ? 28 : 34 }]}
          >
            {slides[index][0]}
          </Text>
          <Text
            style={[
              s.body,
              {
                color: '#B0AFAD',
                marginTop: compact ? 12 : 18,
                marginBottom: compact ? 24 : 52,
              },
            ]}
          >
            {slides[index][1]}
          </Text>
          <View
            style={[
              s.between,
              { minHeight: 48, flexShrink: 0 },
              largeText && {
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 20,
              },
            ]}
          >
            <View style={s.row}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === index ? 20 : 6,
                    height: 6,
                    borderRadius: 4,
                    backgroundColor: i === index ? '#596FAD' : '#252A36',
                  }}
                />
              ))}
            </View>
            <Button
              title={index === 2 ? 'Get Started  ›' : 'Continue  ›'}
              onPress={() => (index === 2 ? finish() : setIndex(index + 1))}
            />
          </View>
        </Reveal>
      </ScrollView>
    </ImageBackground>
  );
}
