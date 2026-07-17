import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  togglePlayPause: () => void;
  goToPreviousSubtitle: () => void;
  goToNextSubtitle: () => void;
  toggleRepeatMode: () => void; // Toggle repeat infinite
  toggleShadowMode: () => void;
  toggleABLoop: () => void;
  increaseSpeed: () => void;
  decreaseSpeed: () => void;
}

export function useKeyboardShortcuts({
  togglePlayPause,
  goToPreviousSubtitle,
  goToNextSubtitle,
  toggleRepeatMode,
  toggleShadowMode,
  toggleABLoop,
  increaseSpeed,
  decreaseSpeed,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousSubtitle();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextSubtitle();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          toggleRepeatMode();
          break;
        case 's':
        case 'S':
          event.preventDefault();
          toggleShadowMode();
          break;
        case 'l':
        case 'L':
          event.preventDefault();
          toggleABLoop();
          break;
        case '+':
        case '=': // Support Shift + = as +
          event.preventDefault();
          increaseSpeed();
          break;
        case '-':
        case '_':
          event.preventDefault();
          decreaseSpeed();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    togglePlayPause,
    goToPreviousSubtitle,
    goToNextSubtitle,
    toggleRepeatMode,
    toggleShadowMode,
    toggleABLoop,
    increaseSpeed,
    decreaseSpeed,
  ]);
}
