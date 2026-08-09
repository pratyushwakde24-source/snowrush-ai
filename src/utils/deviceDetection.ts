// ============================================================
// SnowRush — Device Detection Utilities
// ============================================================

export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function getPreferredQuality(): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (isMobile()) {
    const memory = (navigator as Record<string, unknown>).deviceMemory as number | undefined;
    if (memory && memory <= 4) return 'LOW';
    return 'MEDIUM';
  }
  return 'HIGH';
}

export function getPixelRatio(): number {
  if (isMobile()) return Math.min(window.devicePixelRatio, 1.5);
  return Math.min(window.devicePixelRatio, 2);
}
