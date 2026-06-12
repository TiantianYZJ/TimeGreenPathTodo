import { useEffect } from 'react';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { useUIStore } from '../../stores';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isMobile } = useDeviceType();
  const { setIsMobile, setThemeMode, themeMode } = useUIStore();

  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}
