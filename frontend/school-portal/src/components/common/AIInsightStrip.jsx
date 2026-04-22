import { useState } from 'react';
import s from './AIInsightStrip.module.css';

export default function AIInsightStrip({ text, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className={s.strip}>
      <span className={s.tag}>AI</span>
      <p className={s.text}>{text}</p>
      <button className={s.dismiss} onClick={() => { setDismissed(true); onDismiss?.(); }}>✕</button>
    </div>
  );
}
