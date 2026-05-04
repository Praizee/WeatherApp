import React, { useRef, useEffect, useState } from 'react';
import { Pressable, Platform, StyleProp, ViewStyle, View } from 'react-native';

type RenderProps = { hovered: boolean; pressed: boolean };

interface HoverPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  onContextMenu?: (e: any) => void;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  pressStyle?: StyleProp<ViewStyle>;
  children: ((props: RenderProps) => React.ReactNode) | React.ReactNode;
  accessible?: boolean;
  accessibilityRole?: React.ComponentProps<typeof Pressable>['accessibilityRole'];
  accessibilityLabel?: string;
  disabled?: boolean;
}

export default function HoverPressable({
  onPress,
  onLongPress,
  onContextMenu,
  style,
  hoverStyle,
  pressStyle,
  children,
  accessible = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  disabled,
}: HoverPressableProps) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<View>(null);

  // react-native-web Pressable silently drops unknown event props like onContextMenu,
  // so we attach contextmenu directly to the DOM node via ref.
  useEffect(() => {
    if (Platform.OS !== 'web' || !onContextMenu) return;
    const domNode = (ref.current as any);
    if (!domNode) return;
    const handler = (e: Event) => { e.preventDefault(); onContextMenu(e); };
    domNode.addEventListener('contextmenu', handler);
    return () => domNode.removeEventListener('contextmenu', handler);
  }, [onContextMenu]);

  const webHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
        }
      : {};

  return (
    <Pressable
      ref={ref as any}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        style,
        hovered && hoverStyle,
        pressed && pressStyle,
        Platform.select({ web: { cursor: 'pointer' } as any }),
      ]}
      {...(webHandlers as any)}
    >
      {({ pressed }) =>
        typeof children === 'function' ? children({ hovered, pressed }) : children
      }
    </Pressable>
  );
}
