import { useEffect, useRef, useState } from 'react';
import { isShopOpenNow, formatTimeLabel } from '../lib/time';

const STOPWORDS = new Set(['the', 'a', 'is', 'are', 'to', 'do', 'you', 'kya', 'aap', 'hai', 'ka', 'ke', 'ki', 'mein', 'se', 'ho']);

function scoreFaqMatch(query, faq) {
  const qWords = query
    .toLowerCase()
    .split(/[^a-z0-9\u0900-\u097F]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (qWords.length === 0) return 0;
  const haystack = `${faq.q} ${faq.a}`.toLowerCase();
  let score = 0;
  qWords.forEach((w) => {
    if (haystack.includes(w)) score += 1;
  });
  return score / qWords.length;
}

function findBestFaq(query, faqs) {
  let best = null;
  let bestScore = 0;
  (faqs || []).forEach((faq) => {
    const score = scoreFaqMatch(query, faq);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  });
  return bestScore >= 0.4 ? best : null;
}

// Intent-based quick answers first (hours/location/pricing/etc. — always
// helpful even if it's not phrased like an FAQ), then falls back to
// keyword-scored FAQ matching, then finally a WhatsApp handoff.
function buildReply(query, content) {
  const q = query.toLowerCase();
  const { contact, faqs } = content;

  if (/hour|time|open|close|kab/.test(q)) {
    const open = isShopOpenNow(contact.openTime, contact.closeTime);
    return open
      ? `We're open right now! Hours: ${contact.hours}`
      : `We're closed at the moment. We open at ${formatTimeLabel(contact.openTime)}. Hours: ${contact.hours}`;
  }
  if (/locat|address|where|map|kaha/.test(q)) {
    return `We're at ${contact.address}. Tap "Open in Google Maps" further down the page for directions.`;
  }
  if (/price|cost|charge|₹|rate|kitna/.test(q)) {
    return `Prices vary by item — check the Shop section for "From ₹X" pricing, or message us on WhatsApp for an exact quote.`;
  }
  if (/repair|screen|broken|fix|motherboard/.test(q)) {
    return `We do screen replacement, motherboard repair, and software unlocking — most jobs done in ~30 minutes. Want to book a slot?`;
  }
  if (/recharge|sim|aeps|port|bill/.test(q)) {
    return `Yes — we handle recharge, bill payment, new SIM/number port, and AEPS/Aadhaar ATM withdrawals right at the counter.`;
  }
  if (/ticket|train|bus|flight|hotel|irctc/.test(q)) {
    return `We book bus, railway (IRCTC), flight, hotel and cab tickets right from the shop — just tell us your travel details.`;
  }
  if (/^(hi|hello|hey|namaste)\b/.test(q)) {
    return `Hi! 👋 I can help with hours, location, pricing, or repairs. What do you need?`;
  }

  const matchedFaq = findBestFaq(query, faqs);
  if (matchedFaq) return matchedFaq.a;

  return `I'm not fully sure about that one — tap below to ask the team directly on WhatsApp, they reply fast!`;
}

export default function ChatAssistant({ content }) {
  const cfg = content.chatAssistant || {};
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: cfg.greeting || `Hi! 👋 I'm the ${content.brand} assistant. Ask me about hours, location, prices, or repairs.` },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const reply = buildReply(trimmed, content);
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }, { from: 'bot', text: reply }]);
    setInput('');
  }

  const suggestions = cfg.suggestions?.length
    ? cfg.suggestions
    : ['Are you open now?', 'Where are you located?', 'Screen repair price?', 'Do you do AEPS?'];

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Chat with shop assistant" type="button">
        {open ? '✕' : '💭'}
      </button>
      {open ? (
        <div className="chat-panel">
          <div className="chat-header">
            <span>🤖 Shop Assistant</span>
          </div>
          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chat-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="chat-chip" onClick={() => send(s)} type="button">
                {s}
              </button>
            ))}
          </div>
          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input placeholder="Type a question…" value={input} onChange={(e) => setInput(e.target.value)} />
            <button type="submit" aria-label="Send message">➤</button>
          </form>
          <a className="chat-whatsapp-link" href={`https://wa.me/91${content.contact.phone1}`} target="_blank" rel="noreferrer">
            Need a human? Chat on WhatsApp →
          </a>
        </div>
      ) : null}
    </>
  );
}
