export const dateUtil = {
  isExpired(expiryDate: Date): boolean {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return expiryDate < now
  },

  normalizeToStartOfDay(date: Date): Date {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  },
} as const
