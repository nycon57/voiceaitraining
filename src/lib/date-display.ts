import { formatDistanceToNow } from 'date-fns'

export function formatShortDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString()
}

export function formatShortTime(value: string | number | Date) {
  return new Date(value).toLocaleTimeString()
}

export function formatDueDate(value: string | number | Date) {
  const date = new Date(value)
  const currentYear = new Date().getFullYear()

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== currentYear ? 'numeric' : undefined,
  })
}

export function formatMonthDay(value: string | number | Date) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(value: string | number | Date) {
  return formatDistanceToNow(new Date(value), { addSuffix: true })
}
