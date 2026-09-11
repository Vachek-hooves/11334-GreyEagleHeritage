import { Alert, Linking, Platform } from 'react-native';
export async function openLink(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'Unable to open',
      'Please check that a suitable app is installed and try again.',
    );
  }
}
export function directions(latitude: number, longitude: number, title: string) {
  return openLink(
    Platform.OS === 'ios'
      ? `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodeURIComponent(
          title,
        )}`
      : `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`,
  );
}
