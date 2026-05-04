// renders context menu overlay on web/native.
// Returns null until for now...
import { useEffect } from 'react';
import { Text, Pressable, StyleSheet, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useContextMenu } from '@/src/context/ContextMenuContext';
import { isElectron, getIPC } from '@/src/platform/electron';

export default function ContextMenuOverlay() {
  const { visible, x, y, items, close } = useContextMenu();

  // On Electron, delegate to native OS context menu via IPC
  useEffect(() => {
    if (!visible || !isElectron()) return;
    const ipc = getIPC();
    if (!ipc) return;
    const nativeItems = items.map(({ label, destructive }) => ({ label, destructive: !!destructive }));
    ipc.send('context-menu', nativeItems);
    // IPC response comes back as 'context-menu-click' with the item index
    const handler = (...args: unknown[]) => {
      const idx = args[1] as number;
      items[idx]?.onPress();
      close();
    };
    ipc.on('context-menu-click', handler);
    close(); // dismiss React overlay; native menu is now showing
    return () => ipc.removeListener('context-menu-click', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible || isElectron()) return null;

  return (
    <>
      {/* Backdrop to dismiss */}
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={close}
        accessibilityLabel="Close menu"
      />

      <MotiView
        from={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 120 }}
        style={[
          styles.menu,
          {
            left: Math.min(x, (Platform.OS === 'web' ? window.innerWidth : 400) - 200),
            top: y,
          },
        ]}
      >
        {items.map((item, i) => (
          <Pressable
            key={i}
            onPress={() => { item.onPress(); close(); }}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
              i < items.length - 1 && styles.itemBorder,
            ]}
          >
            {item.icon && (
              <Ionicons
                name={item.icon as any}
                size={15}
                color={item.destructive ? '#EF4444' : '#94A3B8'}
                style={{ marginRight: 10 }}
              />
            )}
            <Text style={[styles.label, item.destructive && styles.labelDestructive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </MotiView>
    </>
  );
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    width: 196,
    backgroundColor: '#1A2740',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    zIndex: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } as any)
      : {}),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  itemPressed: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    color: '#E2E8F0',
    fontSize: 13.5,
    fontWeight: '500',
  },
  labelDestructive: {
    color: '#EF4444',
  },
});
