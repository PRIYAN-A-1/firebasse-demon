export interface StreakStats {
  workoutStreak: number;
  nutritionStreak: number;
  waterStreak: number;
}

export function computeDailyStreak(dates: Date[]): number {
  if (!dates || dates.length === 0) return 0;

  // Normalize dates to YYYY-MM-DD unique set
  const dateStrings = new Set(
    dates.map((d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    })
  );

  let currentStreak = 0;
  const now = new Date();
  let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Check if today has activity
  if (!dateStrings.has(getStr(checkDate))) {
    // If not today, check yesterday (if yesterday was logged, streak is still alive)
    checkDate.setDate(checkDate.getDate() - 1);
    if (!dateStrings.has(getStr(checkDate))) {
      return 0;
    }
  }

  // Count backwards
  while (dateStrings.has(getStr(checkDate))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return currentStreak;
}
