/**
 * Domain layer: the single source of truth for habits, independent of any UI kit.
 *
 * State lives in a pure reducer (model.ts) and is persisted to localStorage
 * (storage.ts) behind a versioned envelope; selectors (selectors.ts) derive
 * streaks and progress. Every UI implementation — Framework7, Fluent, the code
 * kit — consumes this context and nothing else, which is what makes the six
 * design languages possible without duplicating logic. `today` rolls over at
 * midnight and on window focus, so long-lived installed PWAs stay correct.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useCelebration } from '../celebration/CelebrationContext.tsx';
import { formatDateKey, msUntilNextMidnight, todayKey } from './dates.ts';
import {
  completionToggled,
  createHabit,
  habitAdded,
  habitRemoved,
  habitRenamed,
  habitsReducer,
  habitsReplaced,
  normalizeName,
} from './model.ts';
import type { DateKey, Habit, HabitId } from './model.ts';
import { dayProgress, habitStats, overallStats } from './selectors.ts';
import type { DayProgress, HabitStats, OverallStats } from './selectors.ts';
import { clearHabits, loadHabits, saveHabits, seedHabits } from './storage.ts';

export interface HabitInput {
  name: string;
  emoji?: string;
}

/** Everything the UI is allowed to know about habits. */
export interface HabitsApi {
  habits: Habit[];
  today: DateKey;
  todayLabel: string;
  addHabit(input: HabitInput): boolean;
  renameHabit(id: HabitId, input: HabitInput): boolean;
  removeHabit(id: HabitId): boolean;
  toggle(id: HabitId, dateKey: DateKey): void;
  toggleToday(id: HabitId): void;
  progress: DayProgress;
  statsFor(id: HabitId): HabitStats | null;
  overall: OverallStats;
  resetAll(): void;
}

const HabitsContext = createContext<HabitsApi | null>(null);
const TODAY_LABEL_FORMAT: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
const MIDNIGHT_SLACK_MS = 1000;

function useToday(): DateKey {
  const [today, setToday] = useState<DateKey>(todayKey);
  useEffect(() => {
    const refresh = () => setToday((prev) => (prev === todayKey() ? prev : todayKey()));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    let timer: ReturnType<typeof setTimeout>;
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

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { celebrate } = useCelebration();
  const today = useToday();
  const [habits, dispatch] = useReducer(habitsReducer, null, () => loadHabits() ?? seedHabits(todayKey()));
  const latest = useRef(habits);

  useEffect(() => {
    latest.current = habits;
    saveHabits(habits);
  }, [habits]);

  const apply = useCallback(
    (action: Parameters<typeof habitsReducer>[1]): boolean => {
      const next = habitsReducer(latest.current, action);
      if (next === latest.current) return false;
      latest.current = next;
      dispatch(action);
      return true;
    },
    [dispatch],
  );

  const addHabit = useCallback(
    ({ name, emoji }: HabitInput): boolean => {
      const cleanName = normalizeName(name);
      if (!cleanName) return false;
      return apply(habitAdded(createHabit({ name: cleanName, emoji, createdAt: today })));
    },
    [apply, today],
  );

  const renameHabit = useCallback(
    (id: HabitId, { name, emoji }: HabitInput): boolean =>
      normalizeName(name) ? apply(habitRenamed(id, { name, emoji })) : false,
    [apply],
  );

  const removeHabit = useCallback((id: HabitId): boolean => apply(habitRemoved(id)), [apply]);

  const toggle = useCallback(
    (id: HabitId, dateKey: DateKey): void => {
      const before = dayProgress(latest.current, today);
      if (!apply(completionToggled(id, dateKey, today))) return;
      const after = dayProgress(latest.current, today);
      if (after.total > 0 && before.ratio < 1 && after.ratio === 1) celebrate();
    },
    [apply, today, celebrate],
  );

  const toggleToday = useCallback((id: HabitId) => toggle(id, today), [toggle, today]);

  const resetAll = useCallback((): void => {
    clearHabits();
    apply(habitsReplaced(seedHabits(today)));
  }, [apply, today]);

  const statsFor = useCallback(
    (id: HabitId): HabitStats | null => {
      const habit = habits.find((h) => h.id === id);
      return habit ? habitStats(habit, today) : null;
    },
    [habits, today],
  );

  const value = useMemo<HabitsApi>(
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

export function useHabits(): HabitsApi {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within <HabitsProvider>');
  return ctx;
}
