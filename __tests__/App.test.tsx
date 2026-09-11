import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-webview', () => ({ WebView: 'WebView' }));
jest.mock('react-native-linear-gradient', () => 'LinearGradient');
jest.mock('../src/navigation/AppNavigator', () => ({
  AppNavigator: () => null,
}));
test('starts progress immediately and finishes after four seconds even while WebView is starting', async () => {
  jest.useFakeTimers();
  let tree: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });
  expect(
    tree!.root.findByProps({ testID: 'immediate-loading-progress' }),
  ).toBeTruthy();
  expect(JSON.stringify(tree!.toJSON())).toContain('PREPARING YOUR STAY');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(3999);
  });
  expect(JSON.stringify(tree!.toJSON())).toContain('WebView');
  await ReactTestRenderer.act(async () => {
    jest.advanceTimersByTime(1);
  });
  expect(JSON.stringify(tree!.toJSON())).toContain('Discover the Heritage');
  await ReactTestRenderer.act(async () => tree!.unmount());
  jest.useRealTimers();
});
