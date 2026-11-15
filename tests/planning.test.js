import test from 'node:test'
import assert from 'node:assert/strict'
import { planningDemo } from '../src/lib/mockData.js'
import { calculateChecklistProgress, calculateProgress, cloneScheduleItem, forecastCompletion, getScheduleSummary, projectEndDate, updateResponsibleAssignments, validateWeights } from '../src/lib/planning.js'

const copy = (value) => JSON.parse(JSON.stringify(value))

test('o cronograma demonstrativo tem pesos completos e avanço calculado em 62%', () => {
  const phases = copy(planningDemo.phases)
  assert.deepEqual(validateWeights(phases), [])
  assert.equal(calculateProgress(phases, '2026-11-14').actual, 62)
})

test('peso inválido impede cálculo em vez de distribuir percentuais automaticamente', () => {
  const phases = copy(planningDemo.phases)
  phases[0].weight = 21
  const result = calculateProgress(phases, '2026-11-14')
  assert.equal(result.valid, false)
  assert.equal(result.actual, null)
  assert.match(result.issues[0], /somam 101%/)
})

test('tarefa em validação não aumenta o avanço aprovado', () => {
  const phases = copy(planningDemo.phases)
  const before = calculateProgress(phases, '2026-11-14').actual
  phases[2].activities[1].tasks[1].status = 'Concluída'
  const withoutFiscalAcceptance = calculateProgress(phases, '2026-11-14').actual
  assert.equal(withoutFiscalAcceptance, before)
  phases[2].activities[1].tasks[1].validatedAt = '2026-11-14'
  phases[2].activities[1].tasks[1].approvedProgress = 100
  assert.equal(calculateProgress(phases, '2026-11-14').actual, 70.4)
})

test('avanço parcial só entra no cálculo depois do aceite do fiscal', () => {
  const phases = copy(planningDemo.phases)
  const task = phases[2].activities[1].tasks[1]
  task.reportedProgress = 50
  task.approvedProgress = 0
  assert.equal(calculateProgress(phases, '2026-11-14').actual, 62)
  task.approvedProgress = 50
  task.status = 'Em andamento'
  task.validatedAt = '2026-11-14'
  assert.equal(calculateProgress(phases, '2026-11-14').actual, 66.2)
})

test('cópias mantêm a estrutura, mas reiniciam execução, evidências e arquivo', () => {
  const source = copy(planningDemo.phases)
  source[0].archived = true
  let id = 0
  const cloned = source.map((phase) => cloneScheduleItem(phase, () => `nova-id-${++id}`))
  assert.notEqual(cloned[0].id, source[0].id)
  assert.equal(cloned[0].archived, false)
  assert.equal(cloned[0].activities[0].tasks[0].status, 'Pendente')
  assert.equal(cloned[0].activities[0].tasks[0].validatedAt, '')
  assert.deepEqual(cloned[0].activities[0].tasks[0].evidence, [])
  assert.equal(calculateProgress(cloned, '2026-11-14').actual, 0)
})

test('planejado usa datas e peso das tarefas; atraso inclui bloqueios vencidos', () => {
  const phases = copy(planningDemo.phases)
  const result = calculateProgress(phases, '2026-11-14')
  const summary = getScheduleSummary(phases, '2026-11-14')
  assert.ok(result.planned > 0 && result.planned < 100)
  assert.equal(summary.overdue.some((task) => task.id === 'demo-task-10'), true)
  assert.equal(summary.daysLate, 2)
})

test('previsão linear só aparece quando já há avanço validado', () => {
  const phases = copy(planningDemo.phases)
  assert.equal(forecastCompletion(phases, '2026-11-14', 0), '')
  assert.match(forecastCompletion(phases, '2026-11-14', 62), /^2026-/)
})

test('data projetada soma dias corridos incluindo o primeiro dia', () => {
  assert.equal(projectEndDate('2026-11-14', 1), '2026-11-14')
  assert.equal(projectEndDate('2026-11-14', 7), '2026-11-20')
  assert.equal(projectEndDate('2026-11-30', 2), '2026-12-01')
  assert.equal(projectEndDate('2026-11-14', 0), '')
})

test('avanço do diário conta atividades concluídas e pondera cada etapa pelo orçamento', () => {
  const phases = [
    { id: 'p1', name: 'Etapa 1', weight: 40, activities: [{ id: 'a1', weight: 90 }, { id: 'a2', weight: 10 }] },
    { id: 'p2', name: 'Etapa 2', weight: 60, activities: [{ id: 'b1', weight: 5 }] },
  ]
  const result = calculateChecklistProgress(phases, ['a1', 'b1'])
  assert.deepEqual(result.stages.map(({ completed, total, percent, contribution }) => ({ completed, total, percent, contribution })), [
    { completed: 1, total: 2, percent: 50, contribution: 20 },
    { completed: 1, total: 1, percent: 100, contribution: 60 },
  ])
  assert.equal(result.total, 80)
})

test('renomear ou excluir responsável atualiza fase, atividade e tarefa', () => {
  const plans = { obra: { phases: [{ owners: ['Ana', 'Paulo'], activities: [{ owners: ['Ana'], tasks: [{ owners: ['Ana'] }] }] }] } }
  const renamed = updateResponsibleAssignments(plans, 'Ana', 'Ana Nova')
  assert.deepEqual(renamed.obra.phases[0].owners, ['Ana Nova', 'Paulo'])
  assert.deepEqual(renamed.obra.phases[0].activities[0].owners, ['Ana Nova'])
  assert.deepEqual(renamed.obra.phases[0].activities[0].tasks[0].owners, ['Ana Nova'])
  const removed = updateResponsibleAssignments(renamed, 'Ana Nova', '')
  assert.deepEqual(removed.obra.phases[0].owners, ['Paulo'])
  assert.deepEqual(removed.obra.phases[0].activities[0].owners, [])
  assert.deepEqual(removed.obra.phases[0].activities[0].tasks[0].owners, [])
})
