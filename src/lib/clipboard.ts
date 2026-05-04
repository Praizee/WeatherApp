import { Platform } from 'react-native';

export async function copyToClipboard(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    return;
  }
  const { setStringAsync } = await import('expo-clipboard');
  await setStringAsync(text);
}
