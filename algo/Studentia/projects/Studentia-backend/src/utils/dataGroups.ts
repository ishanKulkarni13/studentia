export const DEFAULT_DATA_GROUPS = ['Academics', 'Portfolio', 'Personal'] as const

export function normalizeDataGroupName(value: string) {
  return value.trim().toLowerCase()
}

export function canonicalDefaultDataGroup(value: string) {
  const normalized = normalizeDataGroupName(value)
  return DEFAULT_DATA_GROUPS.find((group) => group.toLowerCase() === normalized)
}
