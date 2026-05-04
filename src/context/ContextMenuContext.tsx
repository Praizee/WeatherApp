import React, { createContext, useCallback, useContext, useState } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  open: (x: number, y: number, items: ContextMenuItem[]) => void;
  close: () => void;
}

const ContextMenuContext = createContext<ContextMenuState>({
  visible: false,
  x: 0,
  y: 0,
  items: [],
  open: () => {},
  close: () => {},
});

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState({ visible: false, x: 0, y: 0, items: [] as ContextMenuItem[] });

  const open = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setState({ visible: true, x, y, items });
  }, []);

  const close = useCallback(() => {
    setState(s => ({ ...s, visible: false }));
  }, []);

  return (
    <ContextMenuContext.Provider value={{ ...state, open, close }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  return useContext(ContextMenuContext);
}
