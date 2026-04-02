"use client";

import { useState, useEffect, useRef } from 'react';
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
    { role: 'ai', text: '👋 Hi! I can help you find meals in Bangladesh within your budget. How much Taka (BDT) do you want to spend?' }
  ]);
  const [budget, setBudget] = useState('500');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const getRemainingKcal = () => {
    const today = new Date().toISOString().split('T')[0];
    const log = getLogForDate(today);
    const goal = getCalorieGoal();
    const total = log.reduce((sum, item) => sum + (item.calories || 0), 0);
    return goal - total;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !budget) return;

    const userMessage = inputMessage.trim() || `My budget is ${budget} Taka. What can I eat?`;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/suggest-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage.trim(), 
          budget, 
          remainingKcal: getRemainingKcal() 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'ai', text: data.text, provider: data.provider }]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <header className={styles.header}>
        <div className={styles.title}>💡 Meal Suggestions</div>
        <a href="/" className={styles.backBtn}>🏠 Dashboard</a>
      </header>

      <div className={styles.card}>
        <div className={styles.setupRow}>
          <div className={styles.setupItem}>
            <label>Current Budget (BDT)</label>
            <input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              placeholder="e.g. 500" 
              className={styles.inputField} 
            />
          </div>
        </div>

        <div className={styles.chatBox} ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'ai' ? styles.aiMsg : styles.userMsg}>
              <div className={styles.msgContent}>
                {m.text}
              </div>
              {m.provider && <div className={styles.providerTag}>via {m.provider}</div>}
            </div>
          ))}
          {loading && <div className={styles.aiMsg}><div className={styles.msgContent}>Thinking...</div></div>}
        </div>

        <form onSubmit={handleSendMessage} className={styles.inputArea}>
          <input 
            type="text" 
            placeholder="Ask anything... (e.g. 'I want fish for lunch')" 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className={styles.msgInput}
            disabled={loading}
          />
          <button type="submit" className={styles.sendBtn} disabled={loading || (!inputMessage.trim() && !budget)}>
            {loading ? '...' : '✈️'}
          </button>
        </form>
      </div>
    </div>
  );
}
