export const TASK_STATUSES = ['Pendente', 'Em andamento', 'Em validação', 'Concluída', 'Bloqueada', 'Reprovada']

export function approvedTaskPercent(task) {
  if (task.approvedProgress !== undefined && task.approvedProgress !== null) {
    if (task.requiresValidation && !task.validatedAt) return 0
    return Math.min(100, Math.max(0, Number(task.approvedProgress) || 0))
  }
  return task.status === 'Concluída' && (!task.requiresValidation || task.validatedAt) ? 100 : 0
}

export function cloneScheduleItem(item, createId) {
  const copy = JSON.parse(JSON.stringify(item))
  copy.id = createId()
  copy.archived = false
  if (copy.activities) copy.activities = copy.activities.map((activity) => cloneScheduleItem(activity, createId))
  if (copy.tasks) copy.tasks = copy.tasks.map((task) => cloneScheduleItem(task, createId))
  if ('status' in copy) Object.assign(copy, { status: 'Pendente', executionDate: '', validatedAt: '', reportedProgress: 0, approvedProgress: 0, justification: '', observation: '', evidence: [] })
  return copy
}

export function validateWeights(phases) {
  const issues = []
  const check = (items, label) => {
    const total = items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0)
    if (Math.abs(total - 100) > 0.01) issues.push(`${label}: os pesos somam ${total}% (devem somar 100%).`)
  }
  if (!phases.length) return ['Este cronograma ainda não tem fases.']
  check(phases, 'Fases da obra')
  phases.forEach((phase) => {
    if (!phase.activities.length) issues.push(`${phase.name}: adicione atividades antes de calcular o avanço.`)
    else check(phase.activities, `Atividades de “${phase.name}”`)
    phase.activities.forEach((activity) => {
      if (!activity.tasks.length) issues.push(`${activity.name}: adicione tarefas de checklist antes de calcular o avanço.`)
      else check(activity.tasks, `Tarefas de “${activity.name}”`)
    })
  })
  return issues
}

function plannedTaskPercent(task, referenceDate) {
  if (!task.start || !task.end) return 0
  const start = Date.parse(`${task.start}T00:00:00`)
  const end = Date.parse(`${task.end}T00:00:00`)
  const ref = Date.parse(`${referenceDate}T00:00:00`)
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(ref)) return 0
  if (ref < start) return 0
  if (ref >= end || end <= start) return 100
  return Math.round(((ref - start) / (end - start)) * 10000) / 100
}

export function calculateProgress(phases, referenceDate) {
  const issues = validateWeights(phases)
  if (issues.length) return { valid: false, issues, actual: null, planned: null }
  let actual = 0
  let planned = 0
  phases.forEach((phase) => phase.activities.forEach((activity) => activity.tasks.forEach((task) => {
    const share = (Number(phase.weight) * Number(activity.weight) * Number(task.weight)) / 10000
    planned += share * (plannedTaskPercent(task, referenceDate) / 100)
    const completedOn = task.validatedAt || task.executionDate
    if ((!completedOn || completedOn <= referenceDate) && (!task.requiresValidation || task.validatedAt)) actual += share * approvedTaskPercent(task) / 100
  })))
  return { valid: true, issues: [], actual: Math.round(actual * 10) / 10, planned: Math.round(planned * 10) / 10 }
}

export function getScheduleSummary(phases, referenceDate) {
  const tasks = phases.flatMap((phase) => phase.activities.flatMap((activity) => activity.tasks.map((task) => ({ ...task, phase: phase.name, activity: activity.name }))))
  const overdue = tasks.filter((task) => task.end && task.end < referenceDate && task.status !== 'Concluída')
  const blockedActivities = phases.flatMap((phase) => phase.activities).filter((activity) => activity.tasks.some((task) => task.status === 'Bloqueada')).length
  const waitingValidation = tasks.filter((task) => task.status === 'Em validação').length
  const pending = tasks.filter((task) => task.status === 'Pendente').length
  const upcoming = tasks.filter((task) => task.start >= referenceDate && task.status !== 'Concluída').sort((a, b) => a.start.localeCompare(b.start)).slice(0, 3)
  const dates = tasks.flatMap((task) => [task.start, task.end]).filter(Boolean).sort()
  const daysLate = overdue.reduce((max, task) => Math.max(max, Math.floor((Date.parse(`${referenceDate}T00:00:00`) - Date.parse(`${task.end}T00:00:00`)) / 86400000)), 0)
  const start = dates[0] || ''
  const end = dates.at(-1) || ''
  const duration = start && end ? Math.floor((Date.parse(`${end}T00:00:00`) - Date.parse(`${start}T00:00:00`)) / 86400000) + 1 : 0
  const consumed = start && referenceDate >= start ? Math.min(duration, Math.floor((Date.parse(`${referenceDate}T00:00:00`) - Date.parse(`${start}T00:00:00`)) / 86400000) + 1) : 0
  return { tasks, overdue, blockedActivities, waitingValidation, pending, upcoming, start, end, duration, consumed, daysLate }
}

export function forecastCompletion(phases, referenceDate, actualProgress) {
  if (!actualProgress || actualProgress <= 0) return ''
  const summary = getScheduleSummary(phases, referenceDate)
  if (!summary.start || !summary.consumed) return ''
  const totalDays = Math.ceil(summary.consumed / (actualProgress / 100))
  const date = new Date(`${summary.start}T00:00:00`)
  date.setDate(date.getDate() + totalDays - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function formatDate(date) {
  if (!date) return 'Não informada'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function daysBetween(start, end) {
  if (!start || !end) return 0
  return Math.floor((Date.parse(`${end}T00:00:00`) - Date.parse(`${start}T00:00:00`)) / 86400000) + 1
}

export function projectEndDate(start, duration) {
  const days = Number(duration)
  if (!start || !Number.isInteger(days) || days < 1) return ''
  const date = new Date(`${start}T00:00:00`)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function calculateChecklistProgress(phases, completedActivityIds) {
  const completedIds = new Set(completedActivityIds)
  const stages = phases.filter((phase) => !phase.archived).map((phase) => {
    const activities = phase.activities.filter((activity) => !activity.archived)
    const completed = activities.filter((activity) => completedIds.has(activity.id)).length
    const percent = activities.length ? Math.round((completed / activities.length) * 100) : 0
    const contribution = activities.length ? (Number(phase.weight) || 0) * percent / 100 : 0
    return { id: phase.id, name: phase.name, completed, total: activities.length, percent, budgetPercent: Number(phase.weight) || 0, contribution }
  })
  return { stages, total: Math.round(stages.reduce((sum, stage) => sum + stage.contribution, 0) * 10) / 10 }
}

export function updateResponsibleAssignments(plans, oldName, newName) {
  const next = JSON.parse(JSON.stringify(plans))
  Object.values(next).forEach((schedule) => schedule.phases?.forEach((phase) => {
    const update = (item) => { item.owners = (item.owners || []).flatMap((name) => name !== oldName ? [name] : newName ? [newName] : []) }
    update(phase)
    phase.activities?.forEach((activity) => { update(activity); activity.tasks?.forEach(update) })
  }))
  return next
}
