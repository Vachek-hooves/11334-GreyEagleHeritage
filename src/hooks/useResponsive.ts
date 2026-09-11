import { useWindowDimensions } from 'react-native';
export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();
  const compact = width < 375 || height < 700;
  return {
    width,
    height,
    compact,
    largeText: fontScale > 1.25,
    spacing: compact ? 14 : 20,
    heroHeight: Math.min(310, Math.max(180, height * 0.35)),
  };
}
