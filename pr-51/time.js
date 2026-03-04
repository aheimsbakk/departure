// Pure time utilities
export function isoToEpochMs(iso) {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

function pad(n){return String(n).padStart(2,'0')}

export function formatCountdown(targetEpochMs, nowMs = Date.now(), translator = null){
  if (typeof targetEpochMs !== 'number') return null;
  const diffMs = targetEpochMs - nowMs;
  if (diffMs <= 0) return translator ? translator('now') : 'Now';
  let totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  totalSec = totalSec % 3600;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}
