/**
 * Time and timezone formatting utilities for API Patch
 * Handles real-time localized display without hardcoded timestamps.
 */

export function formatLocalTime(isoOrTimestamp) {
  if (!isoOrTimestamp) return 'Just now';
  try {
    const date = new Date(isoOrTimestamp);
    if (isNaN(date.getTime())) return String(isoOrTimestamp);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Just now';
  }
}

export function formatRelativeTime(isoOrTimestamp) {
  if (!isoOrTimestamp) return 'Just now';
  try {
    const date = new Date(isoOrTimestamp);
    const now = Date.now();
    const diffMs = now - date.getTime();
    if (isNaN(diffMs)) return 'Just now';
    if (diffMs < 45000) return 'Just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
}

export function getCurrentLocalDate() {
  return new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getCurrentLocalTime() {
  return new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
}
