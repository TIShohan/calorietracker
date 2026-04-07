"use client";

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import styles from './page.module.css';
import { getLogForDate, getCalorieGoal } from '../../lib/storage';

const Toast = ({ message, type = 'success', onDone }) => {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);
  return <div className={`${styles.toast} ${styles[type]}`}>{message}</div>;
};

export default function SuggestionsPage() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I am your AI Coach. Ask me about diet, at-home exercises, budget BDT for meals or healthy meals idea in Bangladesh!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const suggestions = [
    "Low-carb breakfast?",
    "Quick home workout",
    "Budget meal BDT",
    "How to lose 2kg?",
    "Healthy lunch idea"
  ];
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: userMessage, time }]);
    setInputMessage('');
    setLoading(true);

    try {
      const goal = getCalorieGoal();
      const res = await fetch('/api/suggest-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6), // Memory of last 6 messages
          goal: goal // Personalized context
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { role: 'ai', text: data.text, provider: data.provider, time }]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight + 2, 150) + 'px';
    }
  }, [inputMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <header className={styles.header}>
        <div className={styles.title}>🏃 AI Coach</div>
        <a href="/" className={`${styles.backBtn} ${styles.mobileHide}`}>🏠 Dashboard</a>
      </header>


      <div className={styles.card}>
        <div className={styles.chatBox} ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'ai' ? styles.aiMsg : styles.userMsg}>
              <div className={styles.msgWrapper}>
                <div className={styles.msgContent}>
                  {m.text}
                </div>
                <div className={styles.msgMeta}>
                  {m.time} {m.provider && `• via ${m.provider}`}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className={styles.aiMsg}>
              <div className={styles.typingIndicator}>
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        {messages.length < 3 && !loading && (
          <div className={styles.suggestionRow}>
            {suggestions.map((s, idx) => (
              <button key={idx} onClick={() => { setInputMessage(s); textareaRef.current.focus(); }} className={styles.chip}>
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <textarea
            ref={textareaRef}
            placeholder="Ask your mentor anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.msgInput}
            disabled={loading}
          />
          <button type="submit" className={styles.sendBtn} disabled={loading || !inputMessage.trim()}>
            {loading ? '...' : (
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
