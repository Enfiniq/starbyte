import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function useKeyboardNavigation(shortcutMap: { [key: string]: string }) {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const key = e.key.toLowerCase();
      const keyCombo = `alt+${key}`;

      const matchedShortcut = Object.keys(shortcutMap).find(
        (shortcut) => shortcut === keyCombo
      );

      if (matchedShortcut) {
        e.preventDefault();
        e.stopPropagation();
        router.push(shortcutMap[matchedShortcut]);
      }
    };

    document.addEventListener("keydown", handleKeyDown, {
      capture: true,
      signal,
    });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [router, shortcutMap]);
}
export default useKeyboardNavigation;
