export const DEFAULT_REQUEST_GROUPS = ['College', 'Recruiters'] as const

export function normalizeRequestGroupName(value: string) {
  return value.trim().toLowerCase()
}

export function canonicalDefaultRequestGroup(value: string) {
  const normalized = normalizeRequestGroupName(value)
  return DEFAULT_REQUEST_GROUPS.find((group) => group.toLowerCase() === normalized)
}
