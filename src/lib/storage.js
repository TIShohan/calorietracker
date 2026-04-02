// localStorage helper functions

const getToday = () => new Date().toISOString().split('T')[0];

// ── Calorie Log ──
export function getTodayLog() {
  if (typeof window === 'undefined') return [];
  return getLogForDate(getToday());
}

export function saveTodayLog(entries) {
  saveLogForDate(getToday(), entries);
}

export function getLogForDate(dateStr) {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(`calorie_log_${dateStr}`);
  return data ? JSON.parse(data) : [];
}

export function saveLogForDate(dateStr, entries) {
  localStorage.setItem(`calorie_log_${dateStr}`, JSON.stringify(entries));
}

// ── Water Tracker ──
export function getTodayWater() {
  if (typeof window === 'undefined') return 0;
  return getWaterForDate(getToday());
}

export function getWaterForDate(dateStr) {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(`water_${dateStr}`) || '0', 10);
}

export function saveTodayWater(count) {
  localStorage.setItem(`water_${getToday()}`, count.toString());
}

export function saveWaterForDate(dateStr, count) {
  localStorage.setItem(`water_${dateStr}`, count.toString());
}

export function getWaterGoal() {
  if (typeof window === 'undefined') return 8;
  return parseInt(localStorage.getItem('water_goal') || '8', 10);
}

export function saveWaterGoal(goal) {
  localStorage.setItem('water_goal', goal.toString());
}

// ── Favorites ──
export function getFavorites() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('favorites');
  return data ? JSON.parse(data) : [];
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// ── User Profile (BMR) ──
export function getUserProfile() {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('user_profile');
  return data ? JSON.parse(data) : null;
}

export function saveUserProfile(profile) {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

// ── Calorie Goal ──
export function getCalorieGoal() {
  if (typeof window === 'undefined') return 2000;
  return parseInt(localStorage.getItem('calorie_goal') || '2000', 10);
}

export function saveCalorieGoal(goal) {
  localStorage.setItem('calorie_goal', goal.toString());
}

// ── Preferences ──
export function getPreferredAi() {
  if (typeof window === 'undefined') return 'groq';
  return localStorage.getItem('preferred_ai') || 'groq';
}

export function savePreferredAi(model) {
  localStorage.setItem('preferred_ai', model);
}

// ── Onboarding ──
export function hasCompletedOnboarding() {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('onboarding_done') === 'true';
}

export function markOnboardingDone() {
  localStorage.setItem('onboarding_done', 'true');
}

// ── Streak ──
export function calculateStreak() {
  if (typeof window === 'undefined') return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = getLogForDate(dateStr);
    if (log.length > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Weekly Data ──
export function getWeeklyData() {
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const log = getLogForDate(dateStr);
    const totalCal = log.reduce((sum, e) => sum + (e.calories || 0), 0);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    data.push({ day: dayName, calories: totalCal, date: dateStr });
  }
  return data;
}
