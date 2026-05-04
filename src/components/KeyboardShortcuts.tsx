// wires keyboard events and Electron IPC menu actions.
// Renders nothing; placed once in _layout.tsx so shortcuts are always active.
import { useKeyboardShortcuts } from '@/src/hooks/useKeyboardShortcuts';

export default function KeyboardShortcuts() {
  useKeyboardShortcuts();
  return null;
}
