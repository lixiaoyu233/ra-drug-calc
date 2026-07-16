function parseDate(str) {
  if (!str) return new Date()
  const p = str.split('-')
  return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]))
}

function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function diffDays(d1, d2) {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate())
  return Math.round((t2 - t1) / 86400000)
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function getMonthDays(year, month) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay()
}

module.exports = { parseDate, formatDate, diffDays, addDays, getMonthDays, getFirstDayOfMonth }
