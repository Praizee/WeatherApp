import { View, Text, StyleSheet } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import HoverPressable from './HoverPressable';
import { isElectron } from '@/src/platform/electron';

const NAV_ITEMS = [
  { label: 'Home',         icon: 'home-outline' as const,        route: '/'       },
  { label: 'Saved Cities', icon: 'bookmark-outline' as const,    route: '/cities' },
  { label: 'Search',       icon: 'search-outline' as const,      route: '/search' },
] as const;

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const width = collapsed ? 64 : 220;

  return (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={[styles.sidebar, { width, paddingTop: insets.top + 16 }]}
    >
      {/* Logo row */}
      <View style={[styles.logoRow, collapsed && styles.logoRowCollapsed]}>
        <Ionicons name="partly-sunny-outline" size={22} color="#60A5FA" />
        {!collapsed && (
          <Text style={styles.logoText}>Weather</Text>
        )}
      </View>

      {/* Nav items */}
      <View style={styles.nav}>
        {NAV_ITEMS.map(({ label, icon, route }) => {
          const active = pathname === route || (route !== '/' && pathname.startsWith(route));
          return (
            <HoverPressable
              key={route}
              onPress={() => router.push(route as any)}
              accessibilityLabel={label}
              style={[styles.item, collapsed && styles.itemCollapsed, active && styles.itemActive]}
              hoverStyle={styles.itemHover}
            >
              {({ hovered }) => (
                <>
                  {active && <View style={styles.activeBar} />}
                  <Ionicons
                    name={active ? (icon.replace('-outline', '') as any) : icon}
                    size={20}
                    color={active ? '#60A5FA' : hovered ? '#CBD5E1' : '#64748B'}
                  />
                  {!collapsed && (
                    <Text style={[styles.label, active && styles.labelActive, hovered && !active && styles.labelHover]}>
                      {label}
                    </Text>
                  )}
                </>
              )}
            </HoverPressable>
          );
        })}
      </View>

      {/* Footer: Electron badge */}
      {isElectron() && !collapsed && (
        <View style={styles.badge}>
          <Ionicons name="desktop-outline" size={12} color="#475569" />
          <Text style={styles.badgeText}>Desktop</Text>
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#0D1826',
    borderRightWidth: 1,
    borderRightColor: '#1E2D40',
    paddingHorizontal: 0,
    paddingBottom: 24,
    justifyContent: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  logoRowCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  logoText: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nav: {
    flex: 1,
    gap: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 0,
    position: 'relative',
  },
  itemCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: 'rgba(96,165,250,0.08)',
  },
  itemHover: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
  },
  label: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  labelActive: {
    color: '#60A5FA',
  },
  labelHover: {
    color: '#CBD5E1',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E2D40',
  },
  badgeText: {
    color: '#475569',
    fontSize: 11,
  },
});
