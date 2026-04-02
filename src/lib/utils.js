// Utility functions

export function computeTotals(entries) {
  return entries.reduce(
    (totals, e) => ({
      calories: totals.calories + (e.calories || 0),
      protein: totals.protein + (e.protein || 0),
      fat: totals.fat + (e.fat || 0),
      carbs: totals.carbs + (e.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );
}

export function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateBMR(profile) {
  // Mifflin-St Jeor Equation
  const { weight, height, age, gender } = profile;
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = Math.round(bmr * (multipliers[profile.activity] || 1.2));
  return { bmr: Math.round(bmr), tdee };
}

export const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
