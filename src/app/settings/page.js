"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { getUserProfile, saveUserProfile, saveCalorieGoal, getCalorieGoal, getWaterGoal, saveWaterGoal, markOnboardingDone } from '../../lib/storage';

function SettingsContent() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    age: 27,
    gender: 'male',
    heightFt: 5,
    heightIn: 8,
    weight: 70,
    activity: 1.55,
    goalType: 'maintain',
    targetWeight: 70,
    targetMonths: 3,
  });

  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get('onboard') === '1';
  const [currentGoal, setCurrentGoal] = useState(2000);
  const [calculatedGoal, setCalculatedGoal] = useState(null);
  const [customGoal, setCustomGoal] = useState(2000);
  const [waterGoal, setWaterGoal] = useState(8);


  useEffect(() => {
    const p = getUserProfile();
    if (p) setProfile(p);
    const goal = getCalorieGoal();
    setCurrentGoal(goal);
    setCustomGoal(goal);
    setWaterGoal(getWaterGoal());
  }, []);

  const [bmi, setBmi] = useState(0);

  useEffect(() => {
    const { weight, heightFt, heightIn } = profile;
    if (weight && heightFt) {
      const heightInMeters = ((heightFt * 12) + (heightIn || 0)) * 0.0254;
      setBmi(heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : 0);
    }
  }, [profile]);

  const getBmiCategory = () => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { name: 'Underweight', color: '#60a5fa' };
    if (b < 25) return { name: 'Normal Weight', color: '#34d399' };
    if (b < 30) return { name: 'Overweight', color: '#f87171' };
    return { name: 'Obese', color: '#ef4444' };
  };

  const bmiInfo = getBmiCategory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: ["gender", "goalType"].includes(name) ? value : (value === '' ? '' : Number(value))
    }));
  };

  const calculateGoal = () => {
    const { age, gender, heightFt, heightIn, weight, activity, goalType, targetWeight, targetMonths } = profile;

    // Height in cm
    const heightCm = ((heightFt * 12) + heightIn) * 2.54;

    // BMR (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    // TDEE
    let tdee = bmr * activity;

    // Goal adjustments
    let dailyGoal = tdee;
    if (goalType !== 'maintain') {
      const weightDiff = Math.abs(weight - targetWeight);
      const totalKcalRequired = weightDiff * 7700; // ~7700 kcal per kg of fat
      const dailyChangeInfo = totalKcalRequired / (targetMonths * 30.5);

      if (goalType === 'lose') {
        dailyGoal = tdee - dailyChangeInfo;
      } else if (goalType === 'gain') {
        dailyGoal = tdee + dailyChangeInfo;
      }
    }

    // Safety clamps (don't recommend insane goals)
    dailyGoal = Math.max(1200, Math.round(dailyGoal));

    setCalculatedGoal(dailyGoal);
  };

  const saveSettings = () => {
    saveCalorieGoal(customGoal);
    saveWaterGoal(waterGoal);
    saveUserProfile(profile);
    markOnboardingDone();
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.title}>{isOnboarding ? '👋 Welcome! Set up your profile' : '⚙️ Profile Setup'}</div>
        {!isOnboarding && (
          <button onClick={() => router.push('/')} className={styles.backBtn}>Back to Dashboard</button>
        )}
      </header>
      {isOnboarding && (
        <div className={styles.onboardingBanner}>
          Fill in your details so we can calculate the perfect daily calorie goal for you!
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.sectionTitle}>Physical Details</div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Age</label>
            <input type="number" name="age" value={profile.age} onChange={handleChange} />
          </div>
          <div className={styles.field}>
            <label>Gender</label>
            <select name="gender" value={profile.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Height (ft/in)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="number" name="heightFt" value={profile.heightFt} onChange={handleChange} />
              <input type="number" name="heightIn" value={profile.heightIn} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Weight (kg)</label>
            <input type="number" name="weight" value={profile.weight} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.bmiBox}>
          <div className={styles.bmiTitle}>Your BMI Status</div>
          <div className={styles.bmiValue}>{bmi}</div>
          <div className={styles.bmiCategory} style={{ color: bmiInfo.color }}>{bmiInfo.name}</div>
          <div className={styles.bmiBar}>
            <div className={styles.bmiPointer} style={{ left: `${Math.min(100, Math.max(0, (bmi / 40) * 100))}%` }}></div>
          </div>
          <div className={styles.bmiLabels}>
            <span>Underweight</span>
            <span>Normal</span>
            <span style={{ marginLeft: '10px' }}>Over/Obese</span>
          </div>
        </div>

        <div className={styles.sectionTitle}>Lifestyle & Goals</div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Activity Level</label>
            <select name="activity" value={profile.activity} onChange={handleChange}>
              <option value="1.2">Sedentary (Little/no exercise)</option>
              <option value="1.375">Light (Exercise 1-3 days/wk)</option>
              <option value="1.55">Moderate (Exercise 3-5 days/wk)</option>
              <option value="1.725">Active (Exercise 6-7 days/wk)</option>
              <option value="1.9">Very Active (Hard exercise/job)</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Main Goal</label>
            <select name="goalType" value={profile.goalType} onChange={handleChange}>
              <option value="maintain">Maintain Weight</option>
              <option value="lose">Lose Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>
        </div>

        {profile.goalType !== 'maintain' && (
          <div className={styles.grid} style={{ marginTop: '1rem' }}>
            <div className={styles.field}>
              <label>Target (kg)</label>
              <input type="number" name="targetWeight" value={profile.targetWeight} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label>Months</label>
              <input type="number" name="targetMonths" value={profile.targetMonths} onChange={handleChange} />
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button onClick={calculateGoal} className={styles.calcBtn}>Calculate Goal</button>
        </div>

        {calculatedGoal && (
          <div className={styles.resultBox} style={{ marginBottom: '2rem' }}>
            <div className={styles.resultText}>Recommended Daily Goal:</div>
            <div className={styles.resultValue}>{calculatedGoal} kcal</div>
            <button onClick={() => setCustomGoal(calculatedGoal)} className={styles.saveBtn}>Apply Recommendation</button>
          </div>
        )}

        <div className={styles.sectionTitle} style={{ marginTop: '2rem' }}>App Preferences</div>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Kcal Goal</label>
            <input type="number" value={customGoal} onChange={(e) => setCustomGoal(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div className={styles.field}>
            <label>Water (glass)</label>
            <input type="number" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className={styles.actions} style={{ marginTop: '2rem' }}>
          <button onClick={saveSettings} className={styles.saveBtn} style={{ width: '100%' }}>Save All Settings</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <Suspense fallback={<div className={styles.container}><p>Loading settings...</p></div>}>
      <SettingsContent />
    </Suspense>
  );
}
