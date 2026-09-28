/**
 * Domain layer: the single source of truth for habits, independent of any UI kit.
 *
 * State lives in a pure reducer (model.js) and is persisted to localStorage
 * (storage.js) behind a versioned envelope; selectors (selectors.js) derive
 * streaks and progress. Every UI implementation — Framework7, Fluent, the web
 * kit — consumes this context and nothing else, which is what makes the four
 * native looks possible without duplicating logic. `today` rolls over at
 * midnight and on window focus, so long-lived installed PWAs stay correct.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useCelebration } from '../celebration/CelebrationContext.jsx';
import { formatDateKey, msUntilNextMidnight, todayKey } from './dates.js';
import {
  completionToggled,
  createHabit,
  habitAdded,
  habitRemoved,
  habitRenamed,
  habitsReducer,
  habitsReplaced,
  normalizeName,
} from './model.js';
import { dayProgress, habitStats, overallStats } from './selectors.js';
import { clearHabits, loadHabits, saveHabits, seedHabits } from './storage.js';

const HabitsContext = createContext(null);
const TODAY_LABEL_FORMAT = { weekday: 'long', day: 'numeric', month: 'long' };
const MIDNIGHT_SLACK_MS = 1000;

function useToday() {
  const [today, setToday] = useState(todayKey);
  useEffect(() => {
    const refresh = () => setToday((prev) => (prev === todayKey() ? prev : todayKey()));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextMidnight() + MIDNIGHT_SLACK_MS);
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', refresh);
    schedule();
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', refresh);
      clearTimeout(timer);
    };
  }, []);
  return today;
}

export function HabitsProvider({ children }) {
  const { celebrate } = useCelebration();
  const today = useToday();
  const [habits, dispatch] = useReducer(habitsReducer, null, () => loadHabits() ?? seedHabits(todayKey()));
  const latest = useRef(habits);

  useEffect(() => {
    latest.current = habits;
    saveHabits(habits);
  }, [habits]);

  const apply = useCallback(
    (action) => {
      const next = habitsReducer(latest.current, action);
      if (next === latest.current) return false;
      latest.current = next;
      dispatch(action);
      return true;
    },
    [dispatch],
  );

  const addHabit = useCallback(
    ({ name, emoji }) => {
      const cleanName = normalizeName(name);
      if (!cleanName) return false;
      return apply(habitAdded(createHabit({ name: cleanName, emoji, createdAt: today })));
    },
    [apply, today],
  );

  const renameHabit = useCallback(
    (id, { name, emoji }) => (normalizeName(name) ? apply(habitRenamed(id, { name, emoji })) : false),
    [apply],
  );

  const removeHabit = useCallback((id) => apply(habitRemoved(id)), [apply]);

  const toggle = useCallback(
    (id, dateKey) => {
      const before = dayProgress(latest.current, today);
      if (!apply(completionToggled(id, dateKey, today))) return;
      const after = dayProgress(latest.current, today);
      if (after.total > 0 && before.ratio < 1 && after.ratio === 1) celebrate();
    },
    [apply, today, celebrate],
  );

  const toggleToday = useCallback((id) => toggle(id, today), [toggle, today]);

  const resetAll = useCallback(() => {
    clearHabits();
    apply(habitsReplaced(seedHabits(today)));
  }, [apply, today]);

  const statsFor = useCallback(
    (id) => {
      const habit = habits.find((h) => h.id === id);
      return habit ? habitStats(habit, today) : null;
    },
    [habits, today],
  );

  const value = useMemo(
    () => ({
      habits,
      today,
      todayLabel: formatDateKey(today, TODAY_LABEL_FORMAT),
      addHabit,
      renameHabit,
      removeHabit,
      toggle,
      toggleToday,
      progress: dayProgress(habits, today),
      statsFor,
      overall: overallStats(habits, today),
      resetAll,
    }),
    [habits, today, addHabit, renameHabit, removeHabit, toggle, toggleToday, statsFor, resetAll],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within <HabitsProvider>');
  return ctx;
}
