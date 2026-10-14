import { stages } from './config/prank';
export const STORAGE_KEY = 'accessone.session.v1';
export type Session = {
  version: 1;
  stage: number;
  startedAt: number;
  endedAt: number | null;
  id: string;
  clicks: number;
  providers: string[];
  captchas: number;
  questionIds: string[];
  completed: number[];
  lies: number;
  achievements: string[];
  personalityIndex: number;
};
export function freshSession(): Session {
  return {
    version: 1,
    stage: 0,
    startedAt: 0,
    endedAt: null,
    id: `AX1-EU-WEB-${Math.random().toString(16).slice(2, 7).toUpperCase()}`,
    clicks: 0,
    providers: [],
    captchas: 0,
    questionIds: [],
    completed: [],
    lies: 0,
    achievements: [],
    personalityIndex: 0,
  };
}
export function parseSession(raw: string | null): Session {
  if (!raw) return freshSession();
  try {
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Number.isInteger(s.stage) ||
      s.stage < 0 ||
      s.stage >= stages.length ||
      !Number.isFinite(s.startedAt) ||
      s.startedAt < 0 ||
      s.startedAt > Date.now() ||
      !(s.endedAt === null || Number.isFinite(s.endedAt)) ||
      typeof s.id !== 'string' ||
      !/^AX1-EU-WEB-[A-F0-9]{5}$/.test(s.id) ||
      !['clicks', 'captchas', 'lies', 'personalityIndex'].every(
        (k) => Number.isInteger(s[k]) && s[k] >= 0,
      ) ||
      s.personalityIndex > 100 ||
      !['providers', 'questionIds', 'achievements'].every(
        (k) =>
          Array.isArray(s[k]) &&
          s[k].length < 500 &&
          s[k].every((x: unknown) => typeof x === 'string' && x.length < 100),
      ) ||
      !Array.isArray(s.completed) ||
      !s.completed.every(
        (x: unknown) =>
          Number.isInteger(x) && Number(x) >= 0 && Number(x) < stages.length,
      )
    )
      return freshSession();
    // Restore only the documented progress schema, never arbitrary extra data.
    return Object.fromEntries(
      Object.keys(freshSession()).map((key) => [key, s[key]]),
    ) as Session;
  } catch {
    return freshSession();
  }
}
export function advance(s: Session): Session {
  const next = Math.min(s.stage + 1, stages.length - 1);
  const achievements = new Set(s.achievements);
  if (s.stage === 5) achievements.add('terms');
  if (s.stage === 13) achievements.add('human');
  if (s.stage >= 12) achievements.add('half');
  if (s.stage >= 16) achievements.add('sunk');
  if (next === 23) achievements.add('complete');
  return {
    ...s,
    stage: next,
    startedAt: s.startedAt || Date.now(),
    endedAt: next === 23 ? Date.now() : s.endedAt,
    completed: [...new Set([...s.completed, s.stage])],
    lies:
      next === 8 || next === 14 || next === 16 || next === 20
        ? s.lies + 1
        : s.lies,
    achievements: [...achievements],
  };
}
export function progress(stage: number) {
  return (
    [
      0, 0, 8, 16, 23, 30, 36, 43, 40, 46, 52, 59, 66, 73, 79, 100, 93, 94, 95,
      96, 94, 97, 99, 100,
    ][stage] ?? 0
  );
}
export function formatTime(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
