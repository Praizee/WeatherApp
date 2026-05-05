import { useRef, useEffect } from "react";
import { Pressable, Platform } from "react-native";
import { useContextMenu, type ContextMenuItem } from "@/src/context/ContextMenuContext";

interface Props {
  items: ContextMenuItem[];
  style?: any;
  children: React.ReactNode;
}

export default function ContextMenuZone({ items, style, children }: Props) {
  const ref = useRef<typeof Pressable>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const { open } = useContextMenu();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = ref.current as any;
    if (!node) return;
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      open(e.pageX, e.pageY, itemsRef.current);
    };
    node.addEventListener("contextmenu", handler);
    return () => node.removeEventListener("contextmenu", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable ref={ref as any} style={style}>
      {children}
    </Pressable>
  );
}
