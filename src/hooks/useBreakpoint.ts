import { useWindowDimensions } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const bp: Breakpoint = width < 768 ? 'mobile' : width < 1100 ? 'tablet' : 'desktop';
  return {
    bp,
    width,
    isMobile: bp === 'mobile',
    isTablet: bp === 'tablet',
    isDesktop: bp === 'desktop',
    showSidebar: bp !== 'mobile',
  };
}
