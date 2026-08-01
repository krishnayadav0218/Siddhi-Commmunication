import { useEffect, useState } from 'react';

const STORAGE_KEY = 'siddhi_announcement_dismissed';

export default function AnnouncementBar({ content }) {
  const ann = content.announcement;
  // Start hidden on both server and first client render (matches, avoids
  // hydration warnings), then reveal after mount if not previously dismissed.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ann || !ann.enabled || !ann.text) return;
    try {
      if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch (e) {
      setVisible(true);
    }
  }, [ann]);

  if (!ann || !ann.enabled || !ann.text || !visible) return null;

  function handleDismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch (e) {
      // ignore storage errors (e.g. private browsing)
    }
  }

  return (
    <div className="announcement-bar">
      <div className="wrap announcement-inner">
        <span>{ann.text}</span>
        <button onClick={handleDismiss} aria-label="Dismiss announcement" type="button">
          ✕
        </button>
      </div>
    </div>
  );
}
