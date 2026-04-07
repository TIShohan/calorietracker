"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
  PieChart, Pie, Cell
} from 'recharts';
import styles from './page.module.css';
import {
  getLogForDate, saveLogForDate,
  getWaterForDate, saveWaterForDate,
  getCalorieGoal, getWaterGoal,
  calculateStreak, getWeeklyData,
  hasCompletedOnboarding,
  getFavorites, saveFavorites
} from '../lib/storage';

// ── Meal tag helper ──
function getMealTag() {
  const h = new Date().getHours();
  if (h < 10) return 'Breakfast';
  if (h < 13) return 'Lunch';
  if (h < 17) return 'Snack';
  return 'Dinner';
}

function getMealTagForHour(h) {
  if (h < 10) return 'Breakfast';
  if (h < 13) return 'Lunch';
  if (h < 17) return 'Snack';
  return 'Dinner';
}

const MEAL_COLORS = {
  Breakfast: '#f59e0b',
  Lunch: '#3b82f6',
  Snack: '#a78bfa',
  Dinner: '#10b981',
};

// ── Toast Component ──
function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`${styles.toast} ${styles[`toast_${type}`]}`}>
      {message}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [log, setLog] = useState([]);
  const [water, setWater] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8);
  const [goal, setGoal] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [weekly, setWeekly] = useState([]);
  const [foodInput, setFoodInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showIosTip, setShowIosTip] = useState(false);

  // Date navigation
  const todayStr = new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(todayStr);
  const isToday = viewDate === todayStr;

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // Edit state
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCal, setEditCal] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      router.push('/settings?onboard=1');
    }

    // Detect iOS Tip
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = !!(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
    if (isIos && !isStandalone) {
      setShowIosTip(true);
    }
  }, [router]);

  // Load data whenever viewDate changes
  useEffect(() => {
    setLog(getLogForDate(viewDate));
    setWater(getWaterForDate(viewDate));
    setGoal(getCalorieGoal());
    setWaterGoal(getWaterGoal());
    setStreak(calculateStreak());
    setWeekly(getWeeklyData().reverse());
    setFavorites(getFavorites());
  }, [viewDate]);

  // Macros
  const totalCalories = log.reduce((s, i) => s + (i.calories || 0), 0);
  const totalProtein = log.reduce((s, i) => s + (i.protein || 0), 0);
  const totalCarbs = log.reduce((s, i) => s + (i.carbs || 0), 0);
  const totalFat = log.reduce((s, i) => s + (i.fat || 0), 0);
  const remaining = goal - totalCalories;
  const progressPct = Math.min((totalCalories / goal) * 100, 100);

  // Pie chart data
  const pieData = [
    { name: 'Protein', value: totalProtein, color: '#f472b6' },
    { name: 'Carbs', value: totalCarbs, color: '#fbbf24' },
    { name: 'Fat', value: totalFat, color: '#34d399' },
  ].filter(d => d.value > 0);

  // Group log by meal
  const mealGroups = log.reduce((acc, item, idx) => {
    const meal = item.meal || 'Other';
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push({ ...item, __idx: idx });
    return acc;
  }, {});

  const handleLogFood = async (e) => {
    e.preventDefault();
    if (!foodInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/parse-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: foodInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse');
      const mealTag = getMealTag();
      const tagged = data.entries.map(e => ({ ...e, meal: mealTag }));
      const newLog = [...log, ...tagged];
      setLog(newLog);
      saveLogForDate(viewDate, newLog);
      setFoodInput('');
      setWeekly(getWeeklyData().reverse());

      showToast(`✅ ${data.entries.length} item(s) logged via ${data.provider}!`);
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addWater = (amount) => {
    const newVal = Math.max(0, water + amount);
    setWater(newVal);
    saveWaterForDate(viewDate, newVal);
  };

  const deleteLogItem = (indexToDelete) => {
    const newLog = log.filter((_, idx) => idx !== indexToDelete);
    setLog(newLog);
    saveLogForDate(viewDate, newLog);
    setWeekly(getWeeklyData().reverse());
    showToast('🗑️ Entry removed');
  };

  const clearLog = () => {
    setLog([]);
    saveLogForDate(viewDate, []);
    setWeekly(getWeeklyData().reverse());
    setWater(0);
    saveWaterForDate(viewDate, 0);
    showToast('🗑️ Log cleared');
  };

  const startEdit = (item) => {
    setEditingIdx(item.__idx);
    setEditName(item.food_item);
    setEditCal(item.calories);
    setEditProtein(item.protein);
    setEditCarbs(item.carbs);
    setEditFat(item.fat);
  };

  const toggleFavorite = (item) => {
    const isFav = favorites.find(f => f.food_item === item.food_item);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(f => f.food_item !== item.food_item);
      showToast('Removed from Favorites');
    } else {
      // Add a clean copy
      const { meal, __idx, ...cleanItem } = item;
      newFavs = [...favorites, cleanItem];
      showToast('⭐ Saved to Favorites!');
    }
    setFavorites(newFavs);
    saveFavorites(newFavs);
  };

  const addFavoriteToLog = (favItem) => {
    const mealTag = getMealTag();
    const tagged = { ...favItem, meal: mealTag };
    const newLog = [...log, tagged];
    setLog(newLog);
    saveLogForDate(viewDate, newLog);
    setWeekly(getWeeklyData().reverse());
    showToast(`✅ Quick-added ${favItem.food_item}!`);
  };

  const saveEdit = () => {
    const newLog = log.map((item, idx) =>
      idx === editingIdx
        ? { ...item, food_item: editName, calories: +editCal, protein: +editProtein, carbs: +editCarbs, fat: +editFat }
        : item
    );
    setLog(newLog);
    saveLogForDate(viewDate, newLog);
    setEditingIdx(null);
    showToast('✏️ Entry updated');
  };

  const navigateDate = (days) => {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    if (newDate <= todayStr) setViewDate(newDate);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', color: '#020817', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: '600' }}>{label}</p>
          <p style={{ margin: 0, color: '#3b82f6' }}>{payload[0].value} kcal</p>
        </div>
      );
    }
    return null;
  };

  const displayDate = viewDate === todayStr
    ? 'Today'
    : new Date(viewDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      {showIosTip && (
        <div className={styles.iosTip}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>To use it as Application</span>
            <button onClick={() => setShowIosTip(false)} className={styles.iosTipClose}>✕</button>
          </div>
          <div className={styles.iosTipContent}>
            1. Open in <b>Safari</b><br />
            2. Tap <b>"Share"</b> (square icon at bottom)<br />
            3. Tap <b>"Add to Home Screen"</b>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.title}>✨ NutriMind</div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div className={styles.streakBadge}>🔥 {streak} Day Streak</div>
          <a href="/suggestions" style={{ color: '#3b82f6', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            💡 Suggest
          </a>
          <a href="/settings" style={{ color: 'var(--text-muted)', textDecoration: 'none', background: 'var(--surface-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
            ⚙️ Settings
          </a>
        </div>
      </header>

      {/* Date Navigation */}
      <div className={styles.dateNav}>
        <button onClick={() => navigateDate(-1)} className={styles.dateNavBtn}>‹</button>
        <span className={styles.dateLabel}>{displayDate}</span>
        <button onClick={() => navigateDate(1)} className={styles.dateNavBtn} disabled={isToday}>›</button>
      </div>

      <div className={styles.grid}>
        {/* Main Left Column */}
        <div className={styles.mainCol}>
          {/* Macro Summary Card */}
          <div className={styles.card} style={{ marginBottom: '2rem' }}>
            <div className={styles.macroGrid}>
              <div className={styles.macroItem}>
                <div className={styles.macroLabel}>Calories</div>
                <div className={styles.macroValue} style={{ color: '#60a5fa' }}>{totalCalories}</div>
              </div>
              <div className={styles.macroItem}>
                <div className={styles.macroLabel}>Protein</div>
                <div className={styles.macroValue} style={{ color: '#f472b6' }}>{totalProtein}g</div>
              </div>
              <div className={styles.macroItem}>
                <div className={styles.macroLabel}>Carbs</div>
                <div className={styles.macroValue} style={{ color: '#fbbf24' }}>{totalCarbs}g</div>
              </div>
              <div className={styles.macroItem}>
                <div className={styles.macroLabel}>Fat</div>
                <div className={styles.macroValue} style={{ color: '#34d399' }}>{totalFat}g</div>
              </div>
            </div>

            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${progressPct}%`, background: progressPct >= 100 ? 'linear-gradient(90deg, #ef4444, #f87171)' : '' }}
              />
            </div>
            <div className={styles.goalText}>
              <span>{totalCalories} kcal consumed</span>
              <span className={remaining < 0 ? styles.overGoal : styles.underGoal}>
                {remaining >= 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over goal`}
              </span>
              <span>{goal} kcal goal</span>
            </div>

            {/* Macro Pie */}
            {isMounted && pieData.length > 0 && (
              <div className={styles.pieRow}>
                <PieChart width={120} height={120}>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={55} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
                <div className={styles.pieLegend}>
                  {pieData.map((d) => (
                    <div key={d.name} className={styles.pieLegendItem}>
                      <span className={styles.pieDot} style={{ background: d.color }} />
                      <span>{d.name}: {d.value}g</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Food Input (only for today) */}
          {isToday && (
            <div className={styles.card} style={{ marginBottom: '2rem' }}>
              <form className={styles.form} onSubmit={handleLogFood}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., I had 2 scrambled eggs, a toast and a coffee"
                  value={foodInput}
                  onChange={(e) => setFoodInput(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" className={styles.button} disabled={loading || !foodInput.trim()}>
                  {loading ? 'Parsing...' : '✨ Track'}
                </button>
              </form>

              {favorites.length > 0 && (
                <div className={styles.favoritesSection}>
                  <div className={styles.favoritesLabel}>⭐ Quick Add Favorites:</div>
                  <div className={styles.favBoxes}>
                    {favorites.map((fav, i) => (
                      <button key={i} onClick={() => addFavoriteToLog(fav)} className={styles.quickFavBtn}>
                        {fav.food_item} <span className={styles.quickFavKcal}>({fav.calories} kcal)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Today's Log grouped by meal */}
          <div className={styles.card}>
            <div className={styles.logHeader}>
              <h2>Today&apos;s Log</h2>
              {log.length > 0 && (
                <button onClick={clearLog} className={styles.buttonClear}>Clear All</button>
              )}
            </div>

            {log.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No food logged {isToday ? 'today' : 'on this day'} yet.
              </p>
            ) : (
              Object.entries(mealGroups).map(([meal, items]) => (
                <div key={meal} className={styles.mealGroup}>
                  <div className={styles.mealLabel} style={{ color: MEAL_COLORS[meal] || '#64748b' }}>
                    {meal}
                  </div>
                  <div className={styles.logList}>
                    {items.map((item) => (
                      <div key={item.__idx}>
                        {editingIdx === item.__idx ? (
                          <div className={styles.editCard}>
                            <input className={styles.editInput} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Food name" />
                            <div className={styles.editRow}>
                              <input className={styles.editInput} type="number" value={editCal} onChange={e => setEditCal(e.target.value)} placeholder="kcal" />
                              <input className={styles.editInput} type="number" value={editProtein} onChange={e => setEditProtein(e.target.value)} placeholder="P(g)" />
                              <input className={styles.editInput} type="number" value={editCarbs} onChange={e => setEditCarbs(e.target.value)} placeholder="C(g)" />
                              <input className={styles.editInput} type="number" value={editFat} onChange={e => setEditFat(e.target.value)} placeholder="F(g)" />
                            </div>
                            <div className={styles.editActions}>
                              <button onClick={saveEdit} className={styles.saveEditBtn}>Save</button>
                              <button onClick={() => setEditingIdx(null)} className={styles.cancelEditBtn}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.logItem}>
                            <div className={styles.logItemName}>{item.food_item}</div>
                            <div className={styles.logItemStats}>
                              <span style={{ color: '#60a5fa' }}>{item.calories} kcal</span>
                              <span style={{ color: '#f472b6' }}>P: {item.protein}g</span>
                              <span style={{ color: '#fbbf24' }}>C: {item.carbs}g</span>
                              <span style={{ color: '#34d399' }}>F: {item.fat}g</span>
                              <button onClick={() => toggleFavorite(item)} className={styles.editBtn} title="Toggle Favorite">
                                {favorites.find(f => f.food_item === item.food_item) ? '⭐' : '☆'}
                              </button>
                              <button onClick={() => startEdit(item)} className={styles.editBtn}>✏️</button>
                              <button onClick={() => deleteLogItem(item.__idx)} className={styles.deleteBtn}>✕</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className={styles.sidebar}>
          {/* Water Tracker */}
          <div className={styles.card} style={{ marginBottom: '2rem' }}>
            <div className={styles.logHeader}><h2>Water Intake</h2></div>
            <div className={styles.waterSection}>
              <div className={styles.waterCount}>{water} / {waterGoal} 💧</div>
              <div className={styles.waterProgressBar}>
                <div className={styles.waterProgressFill} style={{ width: `${Math.min((water / waterGoal) * 100, 100)}%` }} />
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                {water >= waterGoal ? '🎉 Daily goal reached!' : `${waterGoal - water} glasses to goal`}
              </div>
              <div className={styles.waterControls}>
                <button onClick={() => addWater(-1)} className={styles.waterButton}>−</button>
                <button onClick={() => addWater(1)} className={styles.waterButton}>+</button>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className={styles.card}>
            <div className={styles.logHeader}><h2>Last 7 Days</h2></div>
            <div className={styles.chartSection}>
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekly} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
