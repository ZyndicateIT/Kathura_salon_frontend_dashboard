export const formatLocalDateInput = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const dateOnlyFromValue = (value) => {
  if (!value) return ''

  if (value instanceof Date) return formatLocalDateInput(value)

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
    if (match) return match[1]
  }

  return formatLocalDateInput(value)
}

export const parseDateOnly = (value) => {
  const dateKey = dateOnlyFromValue(value)
  if (!dateKey) return null

  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatDateOnly = (value, options, locale = 'en-GB') => {
  const date = parseDateOnly(value)
  return date ? date.toLocaleDateString(locale, options) : ''
}

export const isSameDateOnly = (left, right) =>
  dateOnlyFromValue(left) === dateOnlyFromValue(right)
