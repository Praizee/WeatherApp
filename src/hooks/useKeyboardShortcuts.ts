import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { queryClient } from '@/src/query/client';
import { useContextMenu } from '@/src/context/ContextMenuContext';
import { getIPC } from '@/src/platform/electron';

type Action =
  | 'nav-search'
  | 'nav-home'
  | 'nav-cities'
  | 'refresh'
  | 'dismiss';

function handleAction(action: Action, router: ReturnType<typeof useRouter>, closeMenu: () => void) {
  switch (action) {
    case 'nav-search':
      router.push('/search');
      break;
    case 'nav-home':
      router.push('/');
      break;
    case 'nav-cities':
      router.push('/cities');
      break;
    case 'refresh':
      queryClient.invalidateQueries({ queryKey: ['weather'] });
      break;
    case 'dismiss':
      closeMenu();
      router.back();
      break;
  }
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { close: closeMenu } = useContextMenu();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    function onKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'f') { e.preventDefault(); handleAction('nav-search', router, closeMenu); return; }
      if (ctrl && e.key === 'h') { e.preventDefault(); handleAction('nav-home',   router, closeMenu); return; }
      if (ctrl && e.key === 'b') { e.preventDefault(); handleAction('nav-cities', router, closeMenu); return; }
      if ((e.key === 'F5') || (ctrl && e.key === 'r')) {
        e.preventDefault();
        handleAction('refresh', router, closeMenu);
        return;
      }
      if (e.key === 'Escape') { handleAction('dismiss', router, closeMenu); return; }
    }

    document.addEventListener('keydown', onKeyDown);

    // Electron IPC bridge — menu items send 'menu-action' events
    const ipc = getIPC();
    const ipcListener = (...args: unknown[]) => {
      const action = args[1] as Action;
      if (action) handleAction(action, router, closeMenu);
    };
    ipc?.on('menu-action', ipcListener);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      ipc?.removeListener('menu-action', ipcListener);
    };
  }, [router, closeMenu]);
}
