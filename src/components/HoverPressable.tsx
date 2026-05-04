import React, { useRef, useState } from 'react';
import { Pressable, Platform, StyleProp, ViewStyle } from 'react-native';

type RenderProps = { hovered: boolean; pressed: boolean };

interface HoverPressableProps {
  onPress?: () => void;
  onLongPress?: () => void;
  onContextMenu?: (e: React.SyntheticEvent) => void;
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

  const webHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setHovered(true),
          onMouseLeave: () => setHovered(false),
          onContextMenu,
        }
      : {};

  return (
    <Pressable
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
