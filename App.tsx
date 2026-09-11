import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/storage/Store';
import { Loader, Onboarding } from './src/screens/Welcome';
import { AppNavigator } from './src/navigation/AppNavigator';
function Content() {
  const [loaded, setLoaded] = useState(false);
  const { state, ready } = useStore();
  const finish = useCallback(() => setLoaded(true), []);
  return (
    <>
      <StatusBar barStyle="light-content" />
      {!loaded || !ready ? (
        <Loader onDone={finish} />
      ) : state.onboarded ? (
        <AppNavigator />
      ) : (
        <Onboarding />
      )}
    </>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Content />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
