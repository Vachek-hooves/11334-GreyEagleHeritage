import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { StoreProvider, useStore } from '../storage/Store';
import { Loader, Onboarding } from '../screens/Welcome';
import { AppNavigator } from './AppNavigator';

function RootNavigatorInner() {
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

export default function RootNavigator() {
  return (
    <StoreProvider>
      <RootNavigatorInner />
    </StoreProvider>
  );
}
