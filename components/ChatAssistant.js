import { useState } from 'react';

const STOPWORDS = new Set(['the', 'a', 'is', 'are', 'to', 'do', 'you', 'kya', 'aap', 'hai', 'ka', 'ke', 'ki', 'mein', 'se', 'ho']);

function scoreMatch(query, faq) {
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

function findBestAnswer(query, faqs) {
  let best = null;
  let bestScore = 0;
  faqs.forEach((faq) => {
    const score = scoreMatch(query, faq);
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  });
  return bestScore >= 0.4 ? best : null;
}

export default function ChatAssistant({ content }) {
  const cfg = content.chatAssistant || {};
  if (!cfg.enabled) return null;

  const { faqs, contact, brand } = content;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', text: cfg.greeting }]);
  const [input, setInput] = useState('');

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = findBestAnswer(trimmed, faqs || []);
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'bot', text: answer ? answer.a : cfg.fallback, isFallback: !answer },
    ]);
    setInput('');
  }

  return (
    <>
      <button
        className="fab-chat"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant'}
        type="button"
      >
        {open ? '✕' : '💬'}
      </button>

      {open ? (
        <div className="chat-window">
          <div className="chat-window-head">
            <strong>{brand} Assistant</strong>
            <span className="chat-status">● Online</span>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.text}
                {m.isFallback ? (
                  <a
                    className="chat-wa-link"
                    href={`https://wa.me/91${contact.phone1}?text=${encodeURIComponent(m.text === cfg.fallback ? '' : m.text)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Continue on WhatsApp →
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          {messages.length <= 1 && cfg.suggestions?.length ? (
            <div className="chat-suggestions">
              {cfg.suggestions.map((s, i) => (
                <button key={i} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              aria-label="Type your question"
            />
            <button type="submit" aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
