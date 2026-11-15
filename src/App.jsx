import { useEffect, useState } from 'react'
import { brl, financial, financialByWork, planningDemo, planningPeople, planningTemplates, works } from './lib/mockData.js'
import { approvedTaskPercent, calculateChecklistProgress, calculateProgress, cloneScheduleItem, daysBetween, formatDate, projectEndDate, updateResponsibleAssignments } from './lib/planning.js'
import './planning.css'

const menu = [
  { id: 'dashboard', label: 'Painel', icon: '▦' },
  { id: 'works', label: 'Obras', icon: '⌂' },
  { id: 'execution', label: 'Execução', icon: '▤' },
  { id: 'approvals', label: 'Aprovações', icon: '✓' },
  { id: 'finance', label: 'Financeiro', icon: 'R$' },
]
const title = { ...Object.fromEntries(menu.map((item) => [item.id, item.label])), materials: 'Materiais' }
const workStatusOptions = ['Projeto', 'Levantamento de preços', 'Stand by', 'Suspenso', 'Em andamento']
function defaultWorkStatus(work) {
  if (work.phase === 'Projetos' || work.phase === 'Concepção') return 'Projeto'
  if (work.status === 'Paralisada') return 'Suspenso'
  return 'Em andamento'
}
const peopleKey = 'codex-planning-people-v2'
const materialsKey = 'codex-materials-demo-v1'
const materialStatuses = ['Solicitação', 'Cotação', 'Aguardando aprovação', 'Aprovada', 'Devolvida', 'Rejeitada', 'Pedido emitido', 'Entrega parcial', 'Recebido']
const approvalProfiles = [
  ['manager', 'Gerência de Infraestrutura'], ['fiscal', 'Engenheiro / Fiscal'],
  ['requester', 'Área solicitante'], ['contractor', 'Mestre / Empreiteiro'],
  ['director', 'Diretoria'], ['finance', 'Financeiro'],
]
const demoMaterials = [
  { id: 'MAT-DEMO-01', demo: true, workId: 'DEMO-01', item: 'Luminária LED hermética 40 W', quantity: 24, unit: 'unidades', phaseId: 'demo-phase-4', phaseName: 'Acabamentos e comissionamento', activity: 'Acabamentos e comissionamento', justification: 'Reposição para a etapa de acabamento.', responsible: 'Ana Ribeiro', dueDate: '2026-11-21', supplier: 'Elétrica Sul · demonstração', value: 6840, status: 'Aguardando aprovação', evidence: ['cotacao-luminarias-demo.pdf'], approval: { status: 'Aguardando ação', area: 'Engenharia / Fiscalização', assignedRole: 'fiscal', assignedTo: 'Ana Ribeiro', requesterRole: 'manager', history: [] } },
  { id: 'MAT-DEMO-02', demo: true, workId: 'DEMO-03', item: 'Cabo elétrico 2,5 mm²', quantity: 300, unit: 'metros', activity: 'Infraestrutura elétrica', justification: 'Material pendente para liberar a frente de serviço.', responsible: 'Marcos Dias', dueDate: '2026-11-18', supplier: 'Materiais Paraná · demonstração', value: 1920, status: 'Pedido emitido', evidence: [] },
  { id: 'MAT-DEMO-03', demo: true, workId: 'DEMO-02', item: 'Perfil metálico para forro', quantity: 40, unit: 'peças', activity: '', justification: 'Solicitação aguardando cotação.', responsible: 'Paulo Lima', dueDate: '2026-11-14', supplier: '', value: null, status: 'Cotação', evidence: [] },
  { id: 'MAT-DEMO-04', demo: true, workId: 'DEMO-01', item: 'Suporte metálico para tubulação', quantity: 12, unit: 'unidades', phaseId: 'demo-phase-3', phaseName: 'Instalações críticas', activity: '', justification: 'Recebimento de demonstração registrado no canteiro.', responsible: 'Ana Ribeiro', dueDate: '2026-11-14', supplier: 'Instalações Sul · demonstração', value: 480, status: 'Recebido', delivered: true, deliveredAt: '2026-11-14', evidence: ['recebimento-demonstrativo.jpg'] },
  { id: 'MAT-DEMO-05', demo: true, workId: 'DEMO-03', item: 'Eletroduto rígido 25 mm', quantity: 80, unit: 'metros', activity: 'Infraestrutura elétrica', justification: 'Complemento de material para a frente elétrica.', responsible: 'Marcos Dias', dueDate: '2026-11-24', supplier: 'Materiais Paraná · demonstração', value: 2160, status: 'Aguardando aprovação', evidence: ['cotacao-eletroduto-demo.pdf'], approval: { status: 'Aguardando ação', area: 'Engenharia / Fiscalização', assignedRole: 'fiscal', assignedTo: 'Ana Ribeiro', requesterRole: 'contractor', history: [] } },
]
const statusTone = (status) => status === 'Atrasada' || status === 'Atrasado' || status === 'Paralisada' || status === 'Bloqueada' || status === 'Reprovada' || status === 'Rejeitada' ? 'danger' : status === 'Atenção' || status === 'Aguardando' || status === 'Aguardando ação' || status === 'Em andamento' || status === 'Em validação' || status === 'Devolvida' ? 'warn' : status === 'Dentro do prazo' || status === 'No prazo' || status === 'Entregue' || status === 'Recebido' || status === 'Concluída' || status === 'Aprovada' ? 'success' : 'neutral'

function Status({ children }) { return <span className={`status ${statusTone(children)}`}><i />{children}</span> }
function Bar({ value, amber = false }) { return <div className={amber ? 'bar amber' : 'bar'}><i style={{ width: `${value}%` }} /></div> }
function Header({ eyebrow, title: heading, subtitle, action }) { return <header className="page-head"><div><p className="overline">{eyebrow}</p><h1>{heading}</h1><p className="subtitle">{subtitle}</p></div>{action}</header> }
function Metric({ label, value, note, tone = '' }) { return <article className={`metric-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article> }
function ProgressRing({ value, label }) {
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : null
  const text = progress === null ? '—' : `${Math.round(progress)}%`
  return <span className="work-ring" role="img" aria-label={`${label}: ${text}`}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="work-ring-track" cx="50" cy="50" r="42" /><circle className="work-ring-value" cx="50" cy="50" r="42" pathLength="100" strokeDasharray={progress === null ? '0 100' : `${progress} 100`} transform="rotate(-90 50 50)" /><text x="50" y="54">{text}</text></svg>
  </span>
}

function getWorkFinancialNumbers(work) {
  const total = work.totalValue ?? (work.id === 'DEMO-01' ? financial.demoTotal : null)
  const paid = work.paidValue ?? null
  const paidPercent = Number.isFinite(total) && total > 0 && Number.isFinite(paid) ? (paid / total) * 100 : null
  return { total, paid, paidPercent }
}

function Dashboard({ navigate, works }) {
  const main = works.find((work) => work.id === 'DEMO-01') || works[0]
  const mainProgress = getPlanningNumbers(main)
  const materialApprovals = loadMaterials().filter((item) => item.status === 'Aguardando aprovação' && (item.approval?.status || 'Aguardando ação') === 'Aguardando ação')
  return <>
    <Header eyebrow="CARTEIRA DE INFRAESTRUTURA" title="Painel de obras" subtitle="Avanço da obra e custo acumulado, com os pontos que pedem sua atenção." action={<button className="button primary" onClick={() => navigate('works')}>＋ Ver carteira</button>} />
    <section className="focus-grid">
      <article className="focus-card dark"><span>CTCH · AVANÇO FÍSICO</span><strong>{mainProgress.actual ?? '—'}<small>{mainProgress.actual === null ? '' : '%'}</small></strong><Bar value={mainProgress.actual ?? 0} /><div className="split-note"><span>Previsto {mainProgress.planned === null ? '—' : `${mainProgress.planned}%`}</span><b>Realizado {mainProgress.actual === null ? '—' : `${mainProgress.actual}%`} {mainProgress.actual === null ? '· ajuste os pesos' : `· ${(mainProgress.planned - mainProgress.actual).toFixed(1)} p.p.`}</b></div></article>
      <article className="focus-card"><span>CUSTO MEDIDO · % DO VALOR TOTAL</span><strong>{main.cost}<small>%</small></strong><Bar value={main.cost} amber /><div className="split-note"><span>{brl(financial.demoMeasured)} medidos</span><b>de {brl(financial.demoTotal)}</b></div></article>
      <article className="focus-card"><span>DIFERENÇA FÍSICO × FINANCEIRO</span><strong className="amber-text">{mainProgress.actual === null ? '—' : `${(mainProgress.actual - main.cost).toFixed(1)}`}<small>{mainProgress.actual === null ? '' : ' p.p.'}</small></strong><p>O avanço físico está comparado ao custo medido neste exemplo.</p><Status>Atenção</Status></article>
    </section>
    <section className="metrics-grid"><Metric label="Obras em andamento" value="11" note="de 15 na carteira fictícia" /><Metric label="Obras atrasadas" value="3" note="1 atividade paralisada" tone="danger-top" /><Metric label="Materiais aguardando aprovação" value={materialApprovals.length} note="tarefas fictícias" tone="warn-top" /><Metric label="Dentro do prazo" value="8" note="próxima entrega nesta semana" tone="success-top" /></section>
    <section className="columns">
      <article className="panel"><div className="panel-title"><div><p className="overline">ACOMPANHAMENTO</p><h2>Carteira · onde atuar</h2></div><button className="text-button" onClick={() => navigate('works')}>VER TODAS →</button></div><div className="table-scroll"><table><thead><tr><th>Obra / etapa</th><th>Status</th><th>Avanço</th><th>Custo</th><th>Próxima atividade</th></tr></thead><tbody>{works.slice(0, 4).map((work) => { const progress = getPlanningNumbers(work); return <tr key={work.id} onClick={() => navigate('works')}><td><b>{work.name}</b><small>{work.phase} · {work.location}</small></td><td><Status>{work.status}</Status></td><td><b>{progress.actual === null ? '—' : `${progress.actual}%`}</b></td><td>{work.cost}%</td><td>{work.next}</td></tr> })}</tbody></table></div></article>
      <article className="panel"><div className="panel-title"><div><p className="overline">TAREFAS · MATERIAIS</p><h2>Precisa da sua atenção</h2></div><button className="text-button" onClick={() => navigate('approvals')}>ABRIR →</button></div><div className="attention-list">{materialApprovals.length ? materialApprovals.map((item) => { const work = works.find((entry) => entry.id === item.workId); return <button className="attention" key={item.id} onClick={() => navigate('approvals', item.id)}><i /><span><b>Aprovar material · {item.item}</b><small>{work?.name || 'Obra'} · {item.approval?.area || 'Aprovador a definir'} · prazo {item.dueDate ? formatDate(item.dueDate) : 'não informado'}</small></span><Status>Aguardando</Status></button> }) : <p className="notice">Nenhum material aguarda aprovação.</p>}</div></article>
    </section>
    <section className="financial-strip">{[['CAPEX aprovado', financial.capex], ['Contratado', financial.contracted], ['Medido', financial.measured], ['Pago', financial.paid]].map(([label, value]) => <div key={label}><span>{label}</span><b>{brl(value)}</b></div>)}</section>
  </>
}

function Works({ works, onCreate, onStatusChange, saveNotice, people, onAddPerson, onRenamePerson, onDeletePerson }) {
  const [selected, setSelected] = useState(works[0])
  const [creating, setCreating] = useState(false)
  const selectedProgress = getPlanningNumbers(selected)
  return <>
    <Header eyebrow="CARTEIRA HOSPITALAR" title="Obras e projetos" subtitle="Cada obra tem seu próprio cronograma, equipe e histórico." action={<button className="button primary" onClick={() => setCreating(true)}>＋ Nova obra</button>} />
    {saveNotice && <p className={`work-save-notice ${saveNotice.startsWith('Não foi possível') ? 'error' : ''}`} role="status">{saveNotice}</p>}
    <div className="filters"><input className="input" placeholder="Buscar obra ou local" aria-label="Buscar obra" /><select className="input"><option>Todas as fases</option><option>Execução</option><option>Projetos</option><option>Entrega</option></select><select className="input"><option>Todos os status</option><option>Atrasada</option><option>Dentro do prazo</option></select></div>
    <section className="works-layout">
      <div className="work-list">{works.map((work) => {
        const progress = getPlanningNumbers(work)
        const money = getWorkFinancialNumbers(work)
        return <article className={`work-card ${selected.id === work.id ? 'chosen' : ''}`} key={work.id}>
          <div className="work-card-title"><button type="button" className="work-card-select" onClick={() => setSelected(work)} aria-pressed={selected.id === work.id}><span><b>{work.name}</b><small>{work.code || work.id} · {work.phase} · {work.location}</small></span></button><Status>{work.status}</Status></div>
          <label className="work-flow-status"><span>Status da obra</span><select className="input" aria-label={`Status da obra ${work.name}`} value={work.workflowStatus || defaultWorkStatus(work)} onChange={(event) => onStatusChange(work.id, event.target.value)}>{workStatusOptions.map((status) => <option key={status}>{status}</option>)}</select></label>
          <span className="work-progress-row"><ProgressRing value={progress.actual} label={`Execução total da obra ${work.name}`} /><span className="work-progress-copy"><b>Execução total</b><small>{progress.actual === null ? 'Pesos pendentes; confira a soma de 100%.' : 'Avanço físico calculado'}</small><small>Previsto: {progress.planned === null ? '—' : `${progress.planned}%`}</small></span></span>
          <span className="work-finance" aria-label={`Resumo financeiro demonstrativo da obra ${work.name}`}><span className="work-finance-label">{work.demo ? 'VALORES FICTÍCIOS · DEMONSTRAÇÃO' : 'RESUMO FINANCEIRO'}</span><span><small>VALOR TOTAL</small><b>{money.total === null ? 'Não informado' : brl(money.total)}</b></span><span><small>VALOR PAGO</small><b>{money.paid === null ? 'Não informado' : brl(money.paid)}</b></span><span><small>PAGO / TOTAL</small><b>{money.paidPercent === null ? '—' : `${money.paidPercent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}</b></span></span>
          <span className="work-card-next"><small>PRÓXIMA ATIVIDADE</small><b>{work.next}</b></span>
        </article>
      })}</div>
      <article className="panel detail"><div className="panel-title"><div><p className="overline">{selected.code || selected.id} · {selected.demo ? 'DEMONSTRAÇÃO' : 'OBRA CADASTRADA'}</p><h2>{selected.name}</h2><p className="subtitle">Hospital São Vicente · {selected.location}</p></div><Status>{selected.status}</Status></div><div className="detail-stats"><div><span>Avanço físico</span><b>{selectedProgress.actual === null ? '—' : `${selectedProgress.actual}%`}</b><small>Previsto {selectedProgress.planned === null ? '—' : `${selectedProgress.planned}%`}</small></div><div><span>Custo medido</span><b>{selected.cost ?? '—'}{selected.cost === null ? '' : '%'}</b><small>{selected.cost == null ? 'A preencher' : 'Base demo'}</small></div><div><span>Responsável</span><b className="person">{selected.owner}</b><small>Equipe cadastrada</small></div></div><div className="detail-block"><span>PRÓXIMA ATIVIDADE</span><b>{selected.next}</b><small>Prazo demonstrativo</small></div><div className="detail-block"><span>ESCOPO PRELIMINAR</span><b>{selected.scope || 'Não informado'}</b><small>{selected.justification ? `Justificativa: ${selected.justification}` : 'Dados de demonstração'}</small></div></article>
    </section>
    {!selected.demo && <article className="panel work-registration-details"><div className="panel-title"><div><p className="overline">CADASTRO INICIAL</p><h2>Necessidade, escopo e autorização</h2></div></div><div className="work-registration-grid"><div><span>Justificativa</span><p>{selected.justification || 'Não informada'}</p></div><div><span>Diagnóstico técnico</span><p>{selected.diagnosis || 'Não informado'}</p></div><div><span>Escopo preliminar</span><p>{selected.scope || 'Não informado'}</p></div><div><span>Datas previstas</span><p>{selected.plannedStart ? formatDate(selected.plannedStart) : 'Início não informado'} · {selected.plannedEnd ? formatDate(selected.plannedEnd) : 'conclusão não informada'}</p></div><div><span>Autorização formal</span><p>{selected.authorizationReference || 'Não anexada'} · {selected.authorizationDate ? formatDate(selected.authorizationDate) : 'sem data registrada'}</p></div></div></article>}
    {!selected.demo && <p className="work-deadline-note">Prazo: {selected.deliveryDays ? `${selected.deliveryDays} dias corridos` : 'não informado'} · Entrega projetada: {selected.plannedEnd ? formatDate(selected.plannedEnd) : 'não calculada'} · Valor total: {selected.totalValue == null ? 'não informado' : brl(selected.totalValue)}</p>}
    {creating && <NewWorkForm works={works} people={people} onAddPerson={onAddPerson} onRenamePerson={onRenamePerson} onDeletePerson={onDeletePerson} onCancel={() => setCreating(false)} onSave={(work) => { onCreate(work); setSelected(work); setCreating(false) }} />}
  </>
}

function NewWorkForm({ works, people, onAddPerson, onRenamePerson, onDeletePerson, onCancel, onSave }) {
  const [owners, setOwners] = useState([])
  const [error, setError] = useState('')
  const [plannedStart, setPlannedStart] = useState('')
  const [deliveryDays, setDeliveryDays] = useState('')
  const projectedEnd = projectDeliveryDate(plannedStart, deliveryDays)
  const save = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const code = String(form.get('code') || '').trim()
    if (code && works.some((work) => (work.code || work.id).toLocaleLowerCase('pt-BR') === code.toLocaleLowerCase('pt-BR'))) {
      setError('Esse código já está cadastrado. Informe outro ou deixe o campo vazio.')
      return
    }
    const id = newId()
    onSave({
      id,
      code: code || `OBR-${id.slice(-6).toUpperCase()}`,
      demo: false,
      name: String(form.get('name')).trim(),
      location: String(form.get('location')).trim(),
      justification: String(form.get('justification')).trim(),
      diagnosis: String(form.get('diagnosis') || '').trim(),
      scope: String(form.get('scope')).trim(),
      phase: 'Concepção',
      status: 'Aguardando autorização',
      progress: null,
      planned: null,
      cost: null,
      totalValue: form.get('totalValue') === '' ? null : Number(form.get('totalValue')),
      paidValue: null,
      owners,
      owner: owners.join(', ') || 'Responsável a definir',
      plannedStart: String(form.get('plannedStart') || ''),
      deliveryDays: form.get('deliveryDays') === '' ? null : Number(form.get('deliveryDays')),
      plannedEnd: projectedEnd,
      authorizationReference: String(form.get('authorizationReference') || '').trim(),
      authorizationDate: String(form.get('authorizationDate') || ''),
      next: 'Definir os próximos passos da concepção',
      delay: 0,
    })
  }
  return <div className="work-form-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}><form className="work-form panel" role="dialog" aria-modal="true" aria-labelledby="new-work-title" onSubmit={save}>
    <div className="panel-title"><div><p className="overline">NOVA OBRA · CONCEPÇÃO</p><h2 id="new-work-title">Cadastrar obra</h2><p className="subtitle">A obra começa em Concepção. Salva neste navegador, sem banco conectado. A autorização formal será exigida antes da execução.</p></div><button type="button" className="icon-button" aria-label="Fechar" onClick={onCancel}>×</button></div>
    <div className="work-form-grid">
      <section><h3>Identificação</h3><label>Nome da obra *<input className="input" name="name" maxLength="140" required autoFocus placeholder="Ex.: Adequação da unidade assistencial" /></label><label>Código interno<input className="input" name="code" maxLength="40" placeholder="Opcional" /></label><label>Unidade / local *<input className="input" name="location" maxLength="120" required placeholder="Hospital, bloco, andar ou área" /></label><label>Valor total da obra (R$)<input className="input" name="totalValue" type="number" min="0" step="0.01" placeholder="Informe quando estiver definido" /></label></section>
      <section><h3>Necessidade e escopo</h3><label>Justificativa e necessidade assistencial *<textarea className="input" name="justification" maxLength="1200" required rows="3" placeholder="Por que a obra é necessária?" /></label><label>Diagnóstico técnico<textarea className="input" name="diagnosis" maxLength="1200" rows="3" placeholder="Opcional" /></label><label>Escopo preliminar *<textarea className="input" name="scope" maxLength="1600" required rows="3" placeholder="Descreva os serviços previstos" /></label></section>
      <section><h3>Equipe e planejamento</h3><ResponsiblePicker selected={owners} onChange={setOwners} people={people} canAdd onAdd={onAddPerson} onRenamePerson={onRenamePerson} onDeletePerson={onDeletePerson} /><div className="work-form-grid dates"><label>Data de início<input className="input" type="date" name="plannedStart" value={plannedStart} onChange={(event) => setPlannedStart(event.target.value)} /></label><label>Dias para entrega<input className="input" type="number" name="deliveryDays" min="1" step="1" value={deliveryDays} onChange={(event) => setDeliveryDays(event.target.value)} placeholder="Dias corridos" /></label><label className="work-projected-date">Data projetada de entrega<input className="input" readOnly value={projectedEnd ? formatDate(projectedEnd) : 'Informe início e dias para calcular'} /></label></div><p className="form-hint">A previsão soma os dias corridos à data de início.</p></section>
      <section><h3>Autorização formal de início</h3><p className="form-hint">Opcional na concepção; necessária antes de avançar para execução.</p><label>Referência do documento<input className="input" name="authorizationReference" maxLength="120" placeholder="Número, protocolo ou link interno" /></label><label>Data da autorização<input className="input" type="date" name="authorizationDate" /></label></section>
    </div>
    {error && <p className="work-form-error" role="alert">{error}</p>}
    <div className="work-form-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button type="submit" className="button primary">Salvar obra</button></div>
  </form></div>
}

const plannerKey = 'codex-planning-demo-v2'
const profiles = [
  { id: 'manager', name: 'Gestor de Infraestrutura', person: 'Ronaldo Lessa' },
  { id: 'fiscal', name: 'Fiscal · Ana Ribeiro', person: 'Ana Ribeiro' },
  { id: 'contractor', name: 'Empreiteiro · Marcos Dias', person: 'Marcos Dias' },
  { id: 'requester', name: 'Área solicitante', person: 'Solicitante Assistencial' },
  { id: 'director', name: 'Diretoria', person: 'Diretoria' },
]
const cloneData = (value) => JSON.parse(JSON.stringify(value))
const newId = () => globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
function updateWorkOwners(workList, oldName, newName) {
  return workList.map((work) => {
    const owners = Array.isArray(work.owners) ? work.owners : String(work.owner || '').split(', ').filter((name) => name && name !== 'Responsável a definir')
    const updated = owners.flatMap((name) => name !== oldName ? [name] : newName ? [newName] : [])
    return { ...work, owners: updated, owner: updated.join(', ') || 'Responsável a definir' }
  })
}
const todayISO = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
const worksStorageKey = 'codex-works-v1'
const workStatusesKey = 'codex-work-statuses-v1'
function projectDeliveryDate(start, days) {
  const count = Number(days)
  if (!start || !Number.isInteger(count) || count < 1) return ''
  const date = new Date(`${start}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() + count)
  return date.toISOString().slice(0, 10)
}
function loadWorks() {
  try {
    const saved = JSON.parse(localStorage.getItem(worksStorageKey) || '[]')
    const savedStatuses = JSON.parse(localStorage.getItem(workStatusesKey) || '{}')
    if (Array.isArray(saved)) return [...saved.filter((work) => work?.id && !works.some((demo) => demo.id === work.id)), ...works].map((work) => ({ ...work, workflowStatus: work.workflowStatus || savedStatuses[work.id] || defaultWorkStatus(work) }))
  } catch { /* Use the built-in demo works when local storage is unavailable. */ }
  return works.map((work) => ({ ...work, workflowStatus: defaultWorkStatus(work) }))
}

function getPlanningNumbers(work) {
  try {
    const plans = JSON.parse(localStorage.getItem(plannerKey) || '{}')
    const phases = plans[work.id]?.phases
    if (phases) {
      const result = calculateProgress(phases, todayISO())
      return { actual: result.actual, planned: result.planned }
    }
  } catch { /* Keep the screen usable with its existing fictitious summary. */ }
  return { actual: work.progress, planned: work.planned }
}

function loadPlanning() {
  try {
    const saved = JSON.parse(localStorage.getItem(plannerKey))
    if (saved) {
      Object.values(saved).forEach((schedule) => schedule.phases?.forEach((phase) => phase.activities?.forEach((activity) => activity.tasks?.forEach((task) => {
        if (task.reportedProgress === undefined) task.reportedProgress = task.status === 'Em validação' ? 100 : approvedTaskPercent(task)
        if (task.approvedProgress === undefined) task.approvedProgress = approvedTaskPercent(task)
      }))))
      Object.values(saved).forEach((schedule) => schedule.versions?.forEach((version) => { if (!version.snapshot) version.snapshot = cloneData(schedule.originalBaseline || schedule.phases || []) }))
      return saved
    }
  } catch { /* Use a known fictitious baseline when browser storage is unavailable. */ }
  const initial = cloneData(planningDemo)
  initial.originalBaseline = cloneData(initial.phases)
  initial.versions = initial.versions.map((version) => ({ ...version, snapshot: cloneData(initial.originalBaseline) }))
  return { [planningDemo.workId]: initial }
}

function weightedGroupProgress(children) {
  if (!children.length || Math.abs(children.reduce((sum, item) => sum + Number(item.weight || 0), 0) - 100) > 0.01) return null
  const values = children.map((item) => item.progress)
  if (values.some((value) => value === null)) return null
  return Math.round(children.reduce((sum, item, index) => sum + Number(item.weight) * values[index] / 100, 0) * 10) / 10
}

function taskProgress(task) { return approvedTaskPercent(task) }
function activityProgress(activity) { return weightedGroupProgress(activity.tasks.map((task) => ({ ...task, progress: taskProgress(task) }))) }
function phaseProgress(phase) { return weightedGroupProgress(phase.activities.map((activity) => ({ ...activity, progress: activityProgress(activity) }))) }
function actualRange(items) {
  const tasks = items.flatMap((item) => item.tasks || item.activities?.flatMap((activity) => activity.tasks) || [])
  const starts = tasks.map((task) => task.executionDate).filter(Boolean).sort()
  const ends = tasks.filter((task) => approvedTaskPercent(task) > 0).map((task) => task.validatedAt || task.executionDate).filter(Boolean).sort()
  return { start: starts[0] || '', end: ends.at(-1) || '' }
}
function loadPlanningPeople() {
  try {
    const saved = JSON.parse(localStorage.getItem(peopleKey))
    if (Array.isArray(saved)) return [...new Set(saved)]
    const legacy = JSON.parse(localStorage.getItem('codex-planning-people-v1'))
    if (Array.isArray(legacy)) return [...new Set([...planningPeople, ...legacy])]
  } catch { /* Use the registered demo people when browser storage is unavailable. */ }
  return planningPeople
}

function ResponsiblePicker({ selected = [], onChange, people, canAdd, onAdd, onRenamePerson, onDeletePerson }) {
  const [newPerson, setNewPerson] = useState('')
  const [message, setMessage] = useState('')
  const [editingPerson, setEditingPerson] = useState('')
  const [editedName, setEditedName] = useState('')
  const add = () => {
    const name = newPerson.trim()
    if (!name) { setMessage('Digite o nome do responsável.'); return }
    if (people.some((person) => person.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) { setMessage('Esse responsável já está cadastrado.'); return }
    onAdd(name)
    onChange([...selected, name])
    setNewPerson('')
    setMessage(`${name} cadastrado e marcado para este item. Confira a caixa selecionada na lista.`)
  }
  const rename = (person) => {
    const name = editedName.trim()
    if (!name) { setMessage('Digite o novo nome.'); return }
    if (people.some((item) => item !== person && item.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'))) { setMessage('Esse responsável já está cadastrado.'); return }
    onRenamePerson(person, name)
    onChange(selected.map((item) => item === person ? name : item))
    setEditingPerson(''); setEditedName(''); setMessage(`Nome atualizado para ${name}.`)
  }
  const remove = (person) => {
    if (!window.confirm(`Excluir ${person} do cadastro e remover das atribuições atuais?`)) return
    onDeletePerson(person)
    onChange(selected.filter((item) => item !== person))
    setMessage(`${person} excluído do cadastro e das atribuições atuais.`)
  }
  return <fieldset className="planner-responsibles"><legend>Responsáveis do cadastro</legend><div>{people.map((person) => <div className="planner-person" key={person}><label><input type="checkbox" checked={selected.includes(person)} onChange={(event) => onChange(event.target.checked ? [...selected, person] : selected.filter((name) => name !== person))} />{person}</label>{canAdd && <div className="planner-person-actions">{editingPerson === person ? <><input aria-label={`Novo nome de ${person}`} maxLength="100" value={editedName} onChange={(event) => setEditedName(event.target.value)} /><button type="button" className="text-button" onClick={() => rename(person)}>Salvar</button><button type="button" className="text-button" onClick={() => setEditingPerson('')}>Cancelar</button></> : <><button type="button" className="text-button" onClick={() => { setEditingPerson(person); setEditedName(person); setMessage('') }}>Renomear</button><button type="button" className="text-button danger-text" onClick={() => remove(person)}>Excluir</button></>}</div>}</div>)}</div>{canAdd && <div className="planner-add-person"><label className="planner-field">Novo responsável<input maxLength="100" value={newPerson} onChange={(event) => setNewPerson(event.target.value)} /></label><button type="button" className="button secondary small" onClick={add}>＋ Cadastrar responsável</button></div>}{message && <p className="planner-form-note" role="status">{message}</p>}</fieldset>
}

function ItemEditor({ draft, onCancel, onSave, people, canAddPerson, onAddPerson, onRenamePerson, onDeletePerson }) {
  const [value, setValue] = useState(() => {
    const item = { description: '', weight: 0, start: '', end: '', owners: [], requiresValidation: true, observation: '', evidence: [], ...draft.item }
    return { ...item, durationDays: item.durationDays || daysBetween(item.start, item.end) || '' }
  })
  const title = draft.type === 'phase' ? 'Etapa / fase' : draft.type === 'activity' ? 'Atividade da etapa' : 'Tarefa / checklist'
  const set = (key, next) => setValue((current) => ({ ...current, [key]: next }))
  return <div className="planner-modal-backdrop" role="presentation"><form className="planner-modal" role="dialog" aria-modal="true" aria-labelledby="planner-editor-title" onSubmit={(event) => { event.preventDefault(); onSave({ ...value, weight: Number(value.weight) || 0 }) }}>
    <div className="panel-title"><div><p className="overline">{draft.item.id ? 'EDITAR' : 'NOVO ITEM'}</p><h2 id="planner-editor-title">{title}</h2></div><button type="button" className="icon-button" aria-label="Fechar" onClick={onCancel}>×</button></div>
    <label className="planner-field">Nome<input required autoFocus maxLength="120" value={value.name || ''} onChange={(event) => set('name', event.target.value)} /></label>
    <label className="planner-field">Descrição / escopo<textarea rows="2" value={value.description || ''} onChange={(event) => set('description', event.target.value)} /></label>
    <div className="planner-form-grid"><label className="planner-field">{draft.type === 'phase' ? '% do orçamento da obra' : draft.type === 'activity' ? '% do orçamento da etapa' : 'Peso no avanço da atividade (%)'}<input required type="number" min="0" max="100" step="0.1" value={value.weight} onChange={(event) => set('weight', event.target.value)} /></label><label className="planner-field">Data de início<input type="date" value={value.start || ''} onChange={(event) => { const start = event.target.value; setValue((current) => ({ ...current, start, end: projectEndDate(start, current.durationDays) })) }} /></label><label className="planner-field">Duração (dias corridos)<input type="number" min="1" step="1" value={value.durationDays} onChange={(event) => { const durationDays = event.target.value; setValue((current) => ({ ...current, durationDays, end: projectEndDate(current.start, durationDays) })) }} /></label></div>
    <p className="planner-field">Data projetada de conclusão: <b>{value.end ? formatDate(value.end) : 'Informe início e duração'}</b></p>
    {draft.type === 'task' && <><label className="planner-check"><input type="checkbox" checked={Boolean(value.requiresValidation)} onChange={(event) => set('requiresValidation', event.target.checked)} /> Exige validação do fiscal antes de entrar no avanço aprovado</label><label className="planner-field">Observações<textarea rows="2" value={value.observation || ''} onChange={(event) => set('observation', event.target.value)} /></label><label className="planner-field">Anexar fotos ou documentos (demonstração local)<input type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={(event) => set('evidence', [...(value.evidence || []), ...Array.from(event.target.files || []).map((file) => file.name)])} /></label>{value.evidence?.length > 0 && <small className="planner-evidence-note">Arquivos selecionados: {value.evidence.join(', ')}. Só os nomes ficam salvos nesta demonstração.</small>}</>}
    <ResponsiblePicker selected={value.owners || []} onChange={(owners) => set('owners', owners)} people={people} canAdd={canAddPerson} onAdd={onAddPerson} onRenamePerson={onRenamePerson} onDeletePerson={onDeletePerson} />
    <p className="planner-form-note">Fases distribuem 100% do orçamento da obra; atividades dividem o orçamento da etapa. Tarefas distribuem o avanço da atividade.</p>
    <div className="planner-modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button type="submit" className="button primary">Salvar {title.toLowerCase()}</button></div>
  </form></div>
}

function RationaleDialog({ action, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')
  return <div className="planner-modal-backdrop planner-rationale-backdrop"><form className="planner-modal" role="dialog" aria-modal="true" aria-labelledby="rationale-title" onSubmit={(event) => { event.preventDefault(); if (reason.trim()) onConfirm(reason.trim()) }}><div className="panel-title"><div><p className="overline">HISTÓRICO DO CRONOGRAMA</p><h2 id="rationale-title">Justificativa necessária</h2></div><button type="button" className="icon-button" aria-label="Fechar" onClick={onCancel}>×</button></div><p className="planner-muted">Descreva o motivo de: {action}.</p><label className="planner-field">Justificativa<textarea required autoFocus rows="3" value={reason} onChange={(event) => setReason(event.target.value)} /></label><div className="planner-modal-actions"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button type="submit" className="button primary">Salvar justificativa</button></div></form></div>
}

function TaskCard({ task, role, actor, today, onChange, onEdit, onArchive }) {
  const canManage = role === 'manager'
  const canValidate = canManage || role === 'fiscal'
  const assignedContractor = role === 'contractor' && task.owners.includes(actor)
  const canUpdate = canManage || role === 'fiscal' || assignedContractor
  const accepted = approvedTaskPercent(task)
  const [percent, setPercent] = useState(String(task.reportedProgress ?? accepted))
  const [message, setMessage] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [returning, setReturning] = useState(false)
  useEffect(() => setPercent(String(task.reportedProgress ?? accepted)), [task.reportedProgress, task.approvedProgress, task.status])
  const report = () => {
    const reported = Number(percent)
    if (!Number.isFinite(reported) || reported < 0 || reported > 100) { setMessage('Informe um percentual entre 0 e 100.'); return }
    if (reported < accepted) { setMessage(`O avanço informado não pode ficar abaixo dos ${accepted}% já aceitos.`); return }
    onChange({ ...task, reportedProgress: reported, approvedProgress: task.requiresValidation ? accepted : reported, status: task.requiresValidation ? 'Em validação' : reported === 100 ? 'Concluída' : 'Em andamento', executionDate: today, validatedAt: task.requiresValidation ? task.validatedAt : (reported === 100 ? today : task.validatedAt) })
    setMessage(task.requiresValidation ? 'Avanço enviado para validação do fiscal.' : 'Avanço registrado.')
  }
  const approve = () => {
    const approved = Number(task.reportedProgress ?? percent)
    onChange({ ...task, status: approved === 100 ? 'Concluída' : 'Em andamento', approvedProgress: approved, validatedAt: today })
  }
  const returnForAdjustment = () => {
    if (!returnReason.trim()) { setMessage('Explique o ajuste necessário antes de devolver.'); return }
    onChange({ ...task, status: 'Reprovada', justification: returnReason.trim() })
    setReturning(false)
  }
  const setStatus = (status) => onChange({ ...task, status, executionDate: status === 'Em andamento' ? (task.executionDate || today) : task.executionDate })
  return <article className={`planner-task ${task.archived ? 'is-archived' : ''}`}>
    <div className="planner-task-head"><div><b>{task.name}</b><small>Peso {task.weight}% · {formatDate(task.start)} a {formatDate(task.end)} · {daysBetween(task.start, task.end) || '—'} dias</small></div><Status>{task.archived ? 'Arquivada' : task.status}</Status></div>
    <div className="planner-task-meta"><span>Responsáveis: {task.owners.length ? task.owners.join(', ') : 'A definir'}</span><span>{task.requiresValidation ? 'Exige aceite do fiscal' : 'Sem validação técnica'}</span>{task.executionDate && <span>Executada em {formatDate(task.executionDate)}</span>}{task.validatedAt && <span>Avanço aceito em {formatDate(task.validatedAt)}</span>}<span>Avanço aprovado: {accepted}%</span>{task.status === 'Em validação' && <span>Informado: {task.reportedProgress ?? 0}%</span>}</div>
    {task.observation && <p className="planner-observation">{task.observation}</p>}
    {task.justification && <p className="planner-observation"><b>Ajuste solicitado:</b> {task.justification}</p>}
    {task.evidence?.length > 0 && <p className="planner-evidence-note">Evidências: {task.evidence.join(', ')}</p>}
    {!task.archived && canUpdate && <div className="planner-task-actions">{task.status === 'Pendente' && <button type="button" className="button secondary small" onClick={() => setStatus('Em andamento')}>Iniciar tarefa</button>}{task.status !== 'Concluída' ? <div className="planner-progress-entry"><label>Percentual executado (%)<input type="number" min={accepted} max="100" step="0.1" value={percent} onChange={(event) => setPercent(event.target.value)} aria-label={`Percentual executado: ${task.name}`} /></label><button type="button" className="button secondary small" onClick={report}>Informar avanço</button></div> : <span className="planner-muted">Tarefa concluída com avanço aprovado de 100%; não há percentual pendente para informar.</span>}{message && <span className="planner-muted" role="status">{message}</span>}{task.status === 'Em validação' && canValidate && <>{returning && <label className="planner-field planner-return-reason">Justificativa da devolução<textarea rows="2" value={returnReason} onChange={(event) => setReturnReason(event.target.value)} /></label>}{returning ? <><button type="button" className="button primary small" onClick={returnForAdjustment}>Confirmar devolução</button><button type="button" className="button secondary small" onClick={() => setReturning(false)}>Cancelar</button></> : <><button type="button" className="button primary small" onClick={approve}>Aprovar avanço</button><button type="button" className="button secondary small" onClick={() => setReturning(true)}>Devolver para ajuste</button></>}</>}{task.status === 'Em validação' && !canValidate && <span className="planner-muted">Aguardando validação do fiscal</span>}{task.status !== 'Bloqueada' && task.status !== 'Concluída' && task.status !== 'Em validação' && <button type="button" className="button secondary small" onClick={() => setStatus('Bloqueada')}>Informar bloqueio</button>}<label className="button secondary small planner-file-button">＋ Evidência<input aria-label={`Anexar evidência: ${task.name}`} type="file" accept="image/*,.pdf,.doc,.docx" multiple onChange={(event) => onChange({ ...task, evidence: [...(task.evidence || []), ...Array.from(event.target.files || []).map((file) => file.name)] })} /></label></div>}
    {!task.archived && canManage && <div className="planner-item-actions"><button type="button" className="text-button" onClick={onEdit}>Editar tarefa</button><button type="button" className="text-button danger-text" onClick={onArchive}>Arquivar tarefa</button></div>}
  </article>
}

function ActivityCard({ activity, phaseId, index, role, actor, today, openEditor, onChangeTask, onDuplicate, onArchive, onMove, onEditActivity, planningOnly = false }) {
  const [expanded, setExpanded] = useState(true)
  const progress = activityProgress(activity)
  const actual = actualRange([activity])
  const manager = role === 'manager'
  return <section className={`planner-activity ${activity.archived ? 'is-archived' : ''}`}>
    <div className="planner-activity-head">{!planningOnly && <button className="planner-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '⌄' : '›'}</button>}<div className="planner-grow"><b>{activity.name}</b><small>{planningOnly ? `${activity.weight}% do orçamento da etapa` : `${activity.weight}% da fase`} · Previsto {formatDate(activity.start)} a {formatDate(activity.end)} · {daysBetween(activity.start, activity.end) || '—'} dias{!planningOnly && ` · Real ${actual.start ? `${formatDate(actual.start)} a ${actual.end ? formatDate(actual.end) : 'em andamento'}` : 'não iniciada'} · ${activity.owners.length ? activity.owners.join(', ') : 'Responsável a definir'}`}</small>{!planningOnly && <Bar value={progress ?? 0} />}</div>{!planningOnly && <strong>{progress === null ? '—' : `${progress}%`}</strong>}</div>
    {manager && !activity.archived && <div className="planner-item-actions">{planningOnly ? <button className="text-button" onClick={onEditActivity}>Editar atividade prevista</button> : <><button className="text-button" onClick={onEditActivity}>Editar</button><button className="text-button" onClick={onDuplicate}>Duplicar</button><button className="text-button" onClick={() => onMove(-1)} disabled={index === 0}>↑ Subir</button><button className="text-button" onClick={() => onMove(1)}>↓ Descer</button><button className="text-button danger-text" onClick={onArchive}>Arquivar</button><button className="button secondary small" onClick={() => openEditor('task', activity.id)}>＋ Tarefa</button></>}</div>}
    {!planningOnly && expanded && <div className="planner-task-list">{activity.tasks.map((task) => <TaskCard key={task.id} task={task} role={role} actor={actor} today={today} onChange={(next) => onChangeTask(phaseId, activity.id, next)} onEdit={() => openEditor('task', activity.id, task)} onArchive={() => onArchive('task', phaseId, activity.id, task.id)} />)}{activity.tasks.filter((task) => task.archived).length > 0 && <p className="planner-muted">Tarefas arquivadas permanecem no histórico e na referência de pesos.</p>}</div>}
  </section>
}

function PhaseCard({ phase, index, role, actor, today, openEditor, onDuplicate, onArchive, onMove, onEditPhase, onChangeTask, onDuplicateActivity, onArchiveItem, onMoveActivity, planningOnly = false }) {
  const [expanded, setExpanded] = useState(!phase.archived)
  const progress = phaseProgress(phase)
  const actual = actualRange([phase])
  const manager = role === 'manager'
  return <article className={`planner-phase ${phase.archived ? 'is-archived' : ''}`}>
    <div className="planner-phase-head">{!planningOnly && <button className="planner-expand" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? '⌄' : '›'}</button>}<div className="planner-grow"><p className="overline">{planningOnly ? 'ETAPA' : 'FASE'} {String(index + 1).padStart(2, '0')} · {planningOnly ? `${phase.weight}% DO ORÇAMENTO` : `PESO ${phase.weight}%`}</p><h3>{phase.name}</h3><small>Previsto {formatDate(phase.start)} a {formatDate(phase.end)} · {daysBetween(phase.start, phase.end) || '—'} dias{!planningOnly && ` · Real ${actual.start ? `${formatDate(actual.start)} a ${actual.end ? formatDate(actual.end) : 'em andamento'}` : 'não iniciada'} · ${phase.owners.length ? phase.owners.join(', ') : 'Responsável a definir'}`}</small>{!planningOnly && <Bar value={progress ?? 0} />}</div>{!planningOnly && <div className="planner-phase-progress">{progress === null ? '—' : `${progress}%`}</div>}</div>
    {phase.description && <p className="planner-description">{phase.description}</p>}
    {manager && !phase.archived && <div className="planner-item-actions">{planningOnly ? <><button className="text-button" onClick={onEditPhase}>Editar etapa</button><button className="button secondary small" onClick={() => openEditor('activity', phase.id)}>＋ Atividade</button></> : <><button className="text-button" onClick={onEditPhase}>Editar fase</button><button className="text-button" onClick={onDuplicate}>Duplicar fase</button><button className="text-button" onClick={() => onMove(-1)} disabled={index === 0}>↑ Subir</button><button className="text-button" onClick={() => onMove(1)}>↓ Descer</button><button className="text-button danger-text" onClick={onArchive}>Arquivar fase</button><button className="button secondary small" onClick={() => openEditor('activity', phase.id)}>＋ Atividade</button></>}</div>}
    {(planningOnly || expanded) && <div className="planner-activities">{phase.activities.filter((activity) => !activity.archived).map((activity, activityIndex) => <ActivityCard key={activity.id} activity={activity} phaseId={phase.id} index={activityIndex} role={role} actor={actor} today={today} openEditor={openEditor} onChangeTask={onChangeTask} onDuplicate={() => onDuplicateActivity(phase.id, activity)} onArchive={() => onArchiveItem('activity', phase.id, activity.id)} onMove={(direction) => onMoveActivity(phase.id, activityIndex, direction)} onEditActivity={() => openEditor('activity', phase.id, activity)} planningOnly={planningOnly} />)}</div>}
    {phase.archived && <p className="planner-muted">Fase arquivada. Pesos e registros aprovados permanecem no cálculo e no histórico.</p>}
  </article>
}

const diaryStorageKey = 'codex-work-diaries-v1'
const demoDiary = { id: 'demo-diary-1', demo: true, date: '2026-11-14', services: 'Compatibilização de gases medicinais · 72%', team: '6', materials: 'Tubulação de cobre · exemplo', occurrenceType: 'Ocorrência', occurrence: 'Aguardando liberação da área para a próxima etapa.', nextTask: 'Validar percurso com Engenharia Clínica', owners: ['Ana Ribeiro', 'Paulo Lima'], photos: ['foto-demonstrativa.jpg'], completedActivityIds: ['demo-act-1', 'demo-act-2', 'demo-act-3', 'demo-act-4'] }

function DailyDiary({ work, schedule, profile, people, today }) {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(diaryStorageKey) || '{}')
      return saved[work.id] || (work.id === planningDemo.workId ? [demoDiary] : [])
    } catch { return work.id === planningDemo.workId ? [demoDiary] : [] }
  })
  const [message, setMessage] = useState('')
  const [activityIds, setActivityIds] = useState([])
  const [owners, setOwners] = useState([])
  const [occurrenceType, setOccurrenceType] = useState('Sem ocorrência')
  const canWrite = ['manager', 'fiscal', 'contractor'].includes(profile)
  const phases = (schedule?.phases || []).filter((phase) => !phase.archived).map((phase) => ({ ...phase, activities: phase.activities.filter((activity) => !activity.archived) }))
  const activities = phases.flatMap((phase) => phase.activities.map((activity) => ({ ...activity, phase: phase.name })))
  const completedActivityIds = [...new Set(entries.flatMap((entry) => entry.completedActivityIds || activities.filter((activity) => entry.activityNames?.includes(activity.name)).map((activity) => activity.id)))]
  const completedSet = new Set(completedActivityIds)
  const checkedIds = [...new Set([...completedActivityIds, ...activityIds])]
  const progress = calculateChecklistProgress(phases, checkedIds)
  const togglePhase = (phase, checked) => setActivityIds((current) => checked ? [...new Set([...current, ...phase.activities.filter((activity) => !completedSet.has(activity.id)).map((activity) => activity.id)])] : current.filter((id) => !phase.activities.some((activity) => activity.id === id)))
  const save = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const services = String(form.get('services') || '').trim()
    if (!activityIds.length || !services) { setMessage('Marque ao menos uma atividade e descreva os serviços realizados.'); return }
    const nextEntry = {
      id: newId(), date: String(form.get('date')), services,
      phaseNames: [...new Set(activities.filter((activity) => activityIds.includes(activity.id)).map((activity) => activity.phase))],
      activityNames: activities.filter((activity) => activityIds.includes(activity.id)).map((activity) => activity.name),
      completedActivityIds: checkedIds,
      team: String(form.get('team') || '').trim(), materials: String(form.get('materials') || '').trim(),
      occurrenceType, occurrence: String(form.get('occurrence') || '').trim(),
      nextTask: String(form.get('nextTask') || ''), nextDate: String(form.get('nextDate') || ''),
      owners, photos: Array.from(form.getAll('photos')).map((file) => file.name).filter(Boolean), actor: profiles.find((item) => item.id === profile)?.name,
    }
    const next = [nextEntry, ...entries.filter((entry) => !entry.demo)]
    setEntries(next)
    try {
      const stored = JSON.parse(localStorage.getItem(diaryStorageKey) || '{}')
      localStorage.setItem(diaryStorageKey, JSON.stringify({ ...stored, [work.id]: next }))
      setMessage('Diário salvo neste navegador.')
      event.currentTarget.reset()
      setActivityIds([]); setOwners([]); setOccurrenceType('Sem ocorrência')
    } catch { setMessage('Não foi possível salvar no navegador. O registro continua nesta tela.') }
  }
  return <section className="columns execution-columns">
    <article className="panel"><div className="panel-title"><div><p className="overline">AVANÇO FÍSICO · EAP</p><h2>Total executado da obra</h2></div><strong className="diary-total-value">{progress.total}%</strong></div><Bar value={progress.total} /><p className="planner-muted">Atividades concluídas sobre atividades previstas; a contribuição de cada etapa considera seu percentual do orçamento.</p>{progress.stages.map((stage) => <div className="diary-stage-progress" key={stage.id}><div className="diary-stage-heading"><b>{stage.name}</b><strong>{stage.percent}%</strong></div><Bar value={stage.percent} /><small>{stage.completed} de {stage.total} atividades concluídas · {stage.budgetPercent}% do orçamento · contribui {stage.contribution.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} p.p. para a obra</small></div>)}</article>
      <article className="panel"><div className="panel-title"><div><p className="overline">{work.demo ? 'DADOS FICTÍCIOS' : 'REGISTRO DA OBRA'}</p><h2>Diário de obra · {work.name}</h2></div></div>
      {canWrite ? <form className="diary-form" onSubmit={save}>
        <label>Data do diário *<input className="input" name="date" type="date" defaultValue={today} required /></label>
        <fieldset className="diary-checks"><legend>Etapas e atividades concluídas *</legend>{phases.length ? phases.map((phase) => { const activityList = phase.activities; const phaseChecked = activityList.length > 0 && activityList.every((activity) => checkedIds.includes(activity.id)); const allCompleted = activityList.length > 0 && activityList.every((activity) => completedSet.has(activity.id)); return <div className="diary-check-group" key={phase.id}><label><input type="checkbox" checked={phaseChecked} disabled={!activityList.length || allCompleted} onChange={(event) => togglePhase(phase, event.target.checked)} /><b>{phase.name}</b></label>{activityList.map((activity) => <label className="diary-check-child" key={activity.id}><input type="checkbox" checked={checkedIds.includes(activity.id)} disabled={completedSet.has(activity.id)} onChange={(event) => setActivityIds((current) => event.target.checked ? [...current, activity.id] : current.filter((id) => id !== activity.id))} />{activity.name}</label>)}</div> }) : <p>Adicione etapas e atividades ao cronograma em Planejamento.</p>}</fieldset>
        <label>Serviços realizados *<textarea className="input" name="services" rows="3" maxLength="1200" required placeholder="Descreva o que foi executado" /></label>
        <label>Equipe presente (pessoas)<input className="input" name="team" type="number" min="0" step="1" placeholder="Quantidade" /></label>
        <label>Materiais utilizados<textarea className="input" name="materials" rows="2" maxLength="600" placeholder="Material, quantidade e unidade; um por linha" /></label>
        <label>Ocorrência<select className="input" value={occurrenceType} onChange={(event) => setOccurrenceType(event.target.value)}><option>Sem ocorrência</option><option>Ocorrência</option><option>Paralisação</option></select></label>
        {occurrenceType !== 'Sem ocorrência' && <label>Motivo e impacto *<textarea className="input" name="occurrence" rows="2" required maxLength="800" placeholder="Informe o motivo e o impacto no prazo" /></label>}
        <label>Próxima atividade<select className="input" name="nextTask"><option value="">Selecione, se aplicável</option>{activities.map((activity) => <option key={activity.id} value={activity.name}>{activity.name}</option>)}</select></label>
        <label>Previsão da próxima atividade<input className="input" name="nextDate" type="date" /></label>
        <fieldset className="diary-checks"><legend>Responsáveis pela próxima atividade</legend>{people.map((person) => <label key={person}><input type="checkbox" checked={owners.includes(person)} onChange={(event) => setOwners((current) => event.target.checked ? [...current, person] : current.filter((name) => name !== person))} />{person}</label>)}</fieldset>
        <label>Fotografias da execução<input className="input" type="file" name="photos" accept="image/*" multiple /></label>
        <p className="form-hint">Demonstração: os arquivos não são enviados; o navegador guarda apenas seus nomes.</p>
        {message && <p className="planner-live" role="status">{message}</p>}
        <button className="button primary full" type="submit" disabled={!activities.length}>Salvar diário</button>
      </form> : <p className="planner-local-notice">Este perfil pode consultar os diários, mas não registrar execução.</p>}
      <div className="diary-entries"><h3>Registros recentes</h3>{entries.map((entry) => <article className="diary-entry" key={entry.id}><p><b>{formatDate(entry.date)}</b> · {entry.demo ? 'Demonstração' : entry.actor}</p><b>{entry.services}</b>{(entry.activityNames || entry.taskNames || []).map((name) => <small key={name}>Atividade: {name}</small>)}{entry.phaseNames?.map((name) => <small key={name}>Etapa: {name}</small>)}{entry.team && <small>Equipe: {entry.team} pessoas</small>}{entry.materials && <small>Materiais: {entry.materials}</small>}{entry.occurrence && <small>{entry.occurrenceType}: {entry.occurrence}</small>}{entry.nextTask && <small>Próxima atividade: {entry.nextTask}{entry.nextDate ? ` · ${formatDate(entry.nextDate)}` : ''}</small>}{entry.photos?.length > 0 && <small>Fotografias: {entry.photos.join(', ')}</small>}</article>)}</div>
    </article>
  </section>
}

function Execution({ works, people, onAddPerson, onRenamePerson, onDeletePerson }) {
  const [tab, setTab] = useState('planning')
  const [plans, setPlans] = useState(loadPlanning)
  const [workId, setWorkId] = useState(planningDemo.workId)
  const [profile, setProfile] = useState('manager')
  const [draft, setDraft] = useState(null)
  const [rationaleRequest, setRationaleRequest] = useState(null)
  const [templateId, setTemplateId] = useState(planningTemplates[0].id)
  const [sourceId, setSourceId] = useState(planningDemo.workId)
  const [notice, setNotice] = useState('')
  const today = todayISO()
  const actor = profiles.find((item) => item.id === profile)
  const schedule = plans[workId]
  const availableSources = works.filter((work) => work.id !== workId && plans[work.id])
  const phases = schedule?.phases || []
  const manager = profile === 'manager'

  useEffect(() => { try { localStorage.setItem(plannerKey, JSON.stringify(plans)) } catch { setNotice('O navegador não permitiu salvar alterações locais.') } }, [plans])

  const logChange = (next, label, { rationale = '', revision = true } = {}) => {
    const time = new Date().toISOString()
    const event = { id: newId(), at: time, actor: actor?.person || 'Perfil de demonstração', summary: label }
    next.events = [event, ...(next.events || [])]
    if (revision) next.versions = [{ id: newId(), at: time, actor: event.actor, summary: label, rationale, snapshot: cloneData(schedule?.phases || []) }, ...(next.versions || [])]
    setPlans((current) => ({ ...current, [workId]: next }))
    setNotice(label)
  }

  const requestRationale = (action, complete) => setRationaleRequest({ action, complete })

  const openEditor = (type, parentId = '', item = null) => setDraft({ type, parentId, item: item ? cloneData(item) : { id: '', name: '', description: '', weight: 0, start: today, end: today, owners: [], requiresValidation: true, observation: '', evidence: [] } })

  const persistItem = (item, rationale = '') => {
    if (!schedule || !draft) return
    const next = cloneData(schedule)
    const saved = { ...item, id: item.id || newId(), archived: Boolean(item.archived), tasks: item.tasks || [], activities: item.activities || [] }
    if (draft.type === 'phase') {
      const index = next.phases.findIndex((phase) => phase.id === saved.id)
      if (index >= 0) next.phases[index] = saved
      else next.phases.push({ ...saved, activities: [] })
    } else if (draft.type === 'activity') {
      const phase = next.phases.find((entry) => entry.id === draft.parentId)
      if (!phase) return
      const index = phase.activities.findIndex((activity) => activity.id === saved.id)
      if (index >= 0) phase.activities[index] = saved
      else phase.activities.push({ ...saved, tasks: [] })
    } else {
      const phase = next.phases.find((entry) => entry.activities.some((activity) => activity.id === draft.parentId))
      const activity = phase?.activities.find((entry) => entry.id === draft.parentId)
      if (!activity) return
      const index = activity.tasks.findIndex((task) => task.id === saved.id)
      if (index >= 0) activity.tasks[index] = saved
      else activity.tasks.push(saved)
    }
    logChange(next, `${draft.item.id ? 'Item atualizado' : 'Item criado'}: ${saved.name}`, { rationale, revision: true })
    setDraft(null)
  }

  const saveItem = (item) => {
    if (!schedule || !draft) return
    const significant = draft.item.id && ['weight', 'start', 'end'].some((key) => String(draft.item[key] ?? '') !== String(item[key] ?? ''))
    if (significant) { requestRationale('alteração de peso ou prazo', (rationale) => persistItem(item, rationale)); return }
    persistItem(item)
  }

  const updateTask = (phaseId, activityId, task) => {
    const next = cloneData(schedule)
    const activity = next.phases.find((phase) => phase.id === phaseId)?.activities.find((entry) => entry.id === activityId)
    if (!activity) return
    const index = activity.tasks.findIndex((item) => item.id === task.id)
    if (index < 0) return
    const previous = activity.tasks[index]
    activity.tasks[index] = task
    const approved = approvedTaskPercent(task) > approvedTaskPercent(previous)
    const summary = task.status === 'Reprovada' ? `Devolvida para ajuste: ${task.name} · ${task.justification}` : `${approved ? 'Avanço aprovado' : 'Execução atualizada'}: ${task.name}`
    logChange(next, summary, { revision: false })
  }

  const renamePerson = (oldName, newName) => { onRenamePerson(oldName, newName); setPlans((current) => updateResponsibleAssignments(current, oldName, newName)) }
  const deletePerson = (name) => { onDeletePerson(name); setPlans((current) => updateResponsibleAssignments(current, name, '')) }

  const reorder = (items, index, direction) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return false
    ;[items[index], items[target]] = [items[target], items[index]]
    return true
  }

  const movePhase = (index, direction) => {
    const next = cloneData(schedule)
    if (reorder(next.phases, index, direction)) logChange(next, 'Ordem das fases alterada')
  }

  const moveActivity = (phaseId, index, direction) => {
    const next = cloneData(schedule)
    const phase = next.phases.find((item) => item.id === phaseId)
    if (phase && reorder(phase.activities, index, direction)) logChange(next, 'Ordem das atividades alterada')
  }

  const duplicatePhase = (phase) => {
    requestRationale('duplicação de fase', (rationale) => {
      const next = cloneData(schedule)
      const index = next.phases.findIndex((item) => item.id === phase.id)
      const copy = cloneScheduleItem(phase, newId)
      copy.name = `Cópia de ${phase.name}`
      next.phases.splice(index + 1, 0, copy)
      logChange(next, `Fase duplicada: ${phase.name}`, { rationale })
    })
  }

  const duplicateActivity = (phaseId, activity) => {
    requestRationale('duplicação de atividade', (rationale) => {
      const next = cloneData(schedule)
      const phase = next.phases.find((item) => item.id === phaseId)
      const index = phase?.activities.findIndex((item) => item.id === activity.id) ?? -1
      if (!phase || index < 0) return
      const copy = cloneScheduleItem(activity, newId)
      copy.name = `Cópia de ${activity.name}`
      phase.activities.splice(index + 1, 0, copy)
      logChange(next, `Atividade duplicada: ${activity.name}`, { rationale })
    })
  }

  const archiveItem = (type, phaseId, activityId = '', taskId = '') => {
    requestRationale(`arquivamento de ${type === 'phase' ? 'fase' : type === 'activity' ? 'atividade' : 'tarefa'}`, (rationale) => {
      const next = cloneData(schedule)
      const phase = next.phases.find((item) => item.id === phaseId)
      const item = type === 'phase' ? phase : phase?.activities.find((entry) => entry.id === activityId)
      const target = type === 'task' ? item?.tasks.find((entry) => entry.id === taskId) : item
      if (target) target.archived = true
      logChange(next, `${type === 'phase' ? 'Fase' : type === 'activity' ? 'Atividade' : 'Tarefa'} arquivada; histórico preservado`, { rationale })
    })
  }

  const createPlan = (kind) => {
    const now = new Date().toISOString()
    const selectedTemplate = planningTemplates.find((item) => item.id === templateId)
    let sourcePhases = []
    let summaryText = 'Cronograma criado do zero.'
    if (kind === 'template' && selectedTemplate) { sourcePhases = cloneData(selectedTemplate.phases); summaryText = `Cronograma criado pelo modelo “${selectedTemplate.name}”.` }
    if (kind === 'duplicate' && plans[sourceId]) { sourcePhases = plans[sourceId].phases.map((phase) => cloneScheduleItem(phase, newId)); summaryText = `Cópia independente do cronograma de ${works.find((work) => work.id === sourceId)?.name || 'outra obra'}.` }
    const newSchedule = { workId, phases: sourcePhases, originalBaseline: cloneData(sourcePhases), originalApprovedAt: now, versions: [{ id: newId(), at: now, actor: actor?.person || '', summary: summaryText, rationale: kind === 'template' ? 'Modelo demonstrativo editável.' : kind === 'duplicate' ? 'Cópia independente demonstrativa.' : 'Início de cronograma.', snapshot: cloneData(sourcePhases) }], events: [] }
    setPlans((current) => ({ ...current, [workId]: newSchedule }))
    setNotice(summaryText)
  }

  const resetDemo = () => {
    if (!window.confirm('Restaurar os cronogramas fictícios deste navegador? Isso desfaz as alterações locais do protótipo.')) return
    const initial = cloneData(planningDemo)
    initial.originalBaseline = cloneData(initial.phases)
    setPlans({ [planningDemo.workId]: initial })
    setWorkId(planningDemo.workId)
    setProfile('manager')
    setNotice('Demonstração restaurada.')
  }

  return <>
    <Header eyebrow="REGISTRO DE CAMPO · PLANEJAMENTO" title="Execução e cronograma" subtitle="Planeje fases e tarefas, acompanhe a execução e valide o avanço físico." action={<a className="button secondary" href="/testes.html" target="_blank" rel="noreferrer">Abrir testes desta rodada</a>} />
    <div className="planner-switch" role="tablist" aria-label="Área de execução"><button role="tab" aria-selected={tab === 'planning'} className={tab === 'planning' ? 'active' : ''} onClick={() => setTab('planning')}>▦ Planejamento</button><button role="tab" aria-selected={tab === 'diary'} className={tab === 'diary' ? 'active' : ''} onClick={() => setTab('diary')}>▤ Diário de obra</button></div>
    <div className="planner-toolbar"><label>Obra — cada cronograma fica separado<select className="input" value={workId} onChange={(event) => setWorkId(event.target.value)}>{works.map((work) => <option key={work.id} value={work.id}>{work.name}</option>)}</select></label><label>Perfil de demonstração<select className="input" value={profile} onChange={(event) => setProfile(event.target.value)}>{profiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    {tab === 'diary' ? <DailyDiary key={workId} work={works.find((item) => item.id === workId) || works[0]} schedule={schedule} profile={profile} people={people} today={today} /> : <>
      <div className="planner-toolbar">{manager && <button className="button secondary" onClick={resetDemo}>Restaurar demonstração</button>}</div>
      <div className="planner-local-notice"><b>Demonstração local.</b> Os registros ficam neste navegador. Perfis simulam permissões; arquivos anexados não são enviados para um servidor.{!manager && <span> Perfil atual: <strong>{actor?.name}</strong>. As regras reais dependem do backend, ainda não especificado.</span>}</div>
      {notice && <p className="planner-live" role="status">{notice}</p>}
      {!schedule ? <section className="planner-empty panel"><span className="planner-empty-icon" aria-hidden="true">▤</span><h2>Esta obra ainda não tem cronograma</h2><p>Monte uma estrutura própria, comece por um modelo editável ou copie o cronograma de outra obra.</p>{manager ? <div className="planner-create-options"><button className="button primary" onClick={() => createPlan('blank')}>＋ Criar do zero</button><div><label>Modelo de cronograma<select className="input" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>{planningTemplates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="button secondary" onClick={() => createPlan('template')}>Usar modelo</button></div>{availableSources.length > 0 && <div><label>Duplicar de outra obra<select className="input" value={sourceId} onChange={(event) => setSourceId(event.target.value)}>{availableSources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="button secondary" onClick={() => createPlan('duplicate')}>Duplicar cronograma</button></div>}</div> : <p>Peça ao Gestor de Infraestrutura para criar ou atribuir um cronograma a esta obra.</p>}</section> : <>
        <section className="panel planner-tree"><div className="panel-title"><div><p className="overline">ATIVIDADES PREVISTAS · CRONOGRAMA POR OBRA</p><h2>{works.find((work) => work.id === workId)?.name}</h2><p className="subtitle">Etapas e atividades previstas, com orçamento e prazo calculado.</p></div>{manager && <button className="button primary" onClick={() => openEditor('phase')}>＋ Nova etapa / fase</button>}</div>
          {phases.some((phase) => !phase.archived) ? phases.map((phase, index) => phase.archived ? null : <PhaseCard key={phase.id} phase={phase} index={index} role={profile} actor={actor?.person} today={today} openEditor={openEditor} onDuplicate={() => duplicatePhase(phase)} onArchive={() => archiveItem('phase', phase.id)} onMove={(direction) => movePhase(index, direction)} onEditPhase={() => openEditor('phase', '', phase)} onChangeTask={updateTask} onDuplicateActivity={duplicateActivity} onArchiveItem={archiveItem} onMoveActivity={moveActivity} planningOnly />) : <div className="planner-empty-inline"><p>Esta obra ainda não tem etapas previstas.</p>{manager && <button className="button secondary" onClick={() => openEditor('phase')}>＋ Adicionar a primeira etapa</button>}</div>}
        </section>
      </>}
      {draft && <ItemEditor draft={draft} onCancel={() => setDraft(null)} onSave={saveItem} people={people} canAddPerson={manager} onAddPerson={onAddPerson} onRenamePerson={renamePerson} onDeletePerson={deletePerson} />}
      {rationaleRequest && <RationaleDialog action={rationaleRequest.action} onCancel={() => setRationaleRequest(null)} onConfirm={(reason) => { const complete = rationaleRequest.complete; setRationaleRequest(null); complete(reason) }} />}
    </>}
  </>
}

function loadMaterials() {
  try {
    const saved = JSON.parse(localStorage.getItem(materialsKey) || '[]')
    const savedById = new Map(saved.map((item) => [item.id, item]))
    return [...demoMaterials.map((item) => ({ ...item, ...savedById.get(item.id) })), ...saved.filter((item) => !item.demo).map((item) => item.status === 'Recebido' && item.delivered === undefined ? { ...item, delivered: true } : item)]
  } catch { return demoMaterials.map((item) => ({ ...item })) }
}

function Materials({ works }) {
  const [records, setRecords] = useState(loadMaterials)
  const [schedules] = useState(loadPlanning)
  const [profile, setProfile] = useState('manager')
  const [query, setQuery] = useState('')
  const [workFilter, setWorkFilter] = useState('all')
  const [formWorkId, setFormWorkId] = useState(works[0]?.id || '')
  const [creating, setCreating] = useState(false)
  const [notice, setNotice] = useState('')
  const manager = profile === 'manager'
  const field = profile === 'fiscal' || profile === 'contractor'
  const canCreate = manager || field
  const canRegisterDelivery = manager || field
  const today = todayISO()
  const canSeeValues = manager || profile === 'finance' || profile === 'director'
  const canManageFlow = manager
  const persist = (next, message) => {
    setRecords(next)
    try {
      localStorage.setItem(materialsKey, JSON.stringify(next))
      setNotice(message)
    } catch { setNotice('Não foi possível salvar no navegador. A alteração ficará disponível somente nesta sessão.') }
  }
  const saveRequest = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const item = String(form.get('item') || '').trim()
    const quantity = Number(form.get('quantity'))
    if (!item || !Number.isFinite(quantity) || quantity <= 0) return
    const workId = String(form.get('workId'))
    const phaseId = String(form.get('phaseId') || '')
    const phase = schedules[workId]?.phases.find((entry) => entry.id === phaseId)
    const record = {
      id: newId(), demo: false, workId, item, quantity,
      unit: String(form.get('unit') || '').trim(), phaseId, phaseName: phase?.name || '', activity: '',
      justification: String(form.get('justification') || '').trim(), responsible: String(form.get('responsible') || '').trim(),
      dueDate: String(form.get('dueDate') || ''), supplier: '', value: null, status: 'Solicitação', evidence: [],
    }
    persist([record, ...records], 'Solicitação de material salva neste navegador.')
    setCreating(false)
  }
  const update = (id, change, message) => persist(records.map((record) => record.id === id ? { ...record, ...change } : record), message)
  const reset = () => {
    if (!window.confirm('Restaurar os materiais fictícios e remover as solicitações criadas neste navegador?')) return
    let cleared = true
    try { localStorage.removeItem(materialsKey) } catch { cleared = false }
    setRecords(demoMaterials.map((item) => ({ ...item })))
    setNotice(cleared ? 'Demonstração de materiais restaurada.' : 'Tela restaurada nesta sessão, mas o navegador não permitiu limpar os dados salvos.')
  }
  const visible = records.filter((record) => {
    const work = works.find((item) => item.id === record.workId)
    const matches = `${record.item} ${record.supplier} ${work?.name || ''}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
    return matches && (workFilter === 'all' || record.workId === workFilter)
  })
  const counts = materialStatuses.map((status) => [status, records.filter((item) => item.status === status).length])
  const deliveryStatus = (record) => record.delivered ? 'Entregue' : !record.dueDate ? 'Sem previsão' : record.dueDate < today ? 'Atrasado' : 'No prazo'
  const changeStatus = (record, status) => {
    if (status === 'Aguardando aprovação' && (!record.supplier || record.value == null)) {
      setNotice('Preencha fornecedor e valor na etapa Orçamento antes de enviar para Aprovação.')
      return
    }
    update(record.id, { status, ...(status === 'Recebido' ? { delivered: true, deliveredAt: today } : {}) }, `Status atualizado: ${status}.`)
  }
  const toggleDelivered = (record, delivered) => update(record.id, { delivered, deliveredAt: delivered ? today : '', status: delivered ? 'Recebido' : 'Pedido emitido' }, delivered ? 'Entrega marcada como recebida.' : 'Entrega desmarcada; solicitação voltou para Pedido emitido.')
  const openRequestForm = () => { const workId = workFilter !== 'all' ? workFilter : works[0]?.id || ''; setFormWorkId(workId); setCreating(true) }
  const workGroups = works.filter((work) => workFilter === 'all' || work.id === workFilter).map((work) => {
    const entries = visible.filter((record) => record.workId === work.id)
    const byPhase = new Map()
    entries.forEach((record) => {
      const phaseName = record.phaseName || record.activity || 'Sem etapa vinculada'
      byPhase.set(phaseName, [...(byPhase.get(phaseName) || []), record])
    })
    return { work, phases: [...byPhase.entries()] }
  })
  return <>
    <Header eyebrow="COMPRAS · OBRA E ATIVIDADE" title="Materiais" subtitle="Acompanhe solicitações, cotações, aprovações, pedidos e recebimentos." action={<span className="demo-pill">DADOS FICTÍCIOS</span>} />
    <div className="planner-local-notice"><b>Demonstração local.</b> Os registros ficam neste navegador; perfis simulam visibilidade e não substituem permissões reais.</div>
    <div className="planner-toolbar materials-toolbar"><label>Perfil de demonstração<select className="input" value={profile} onChange={(event) => setProfile(event.target.value)}><option value="manager">Gerência de Infraestrutura</option><option value="fiscal">Engenheiro / Fiscal</option><option value="contractor">Mestre / Empreiteiro</option><option value="requester">Área solicitante</option><option value="director">Diretoria</option><option value="finance">Financeiro</option></select></label>{manager && <button className="button secondary" onClick={reset}>Restaurar demonstração</button>}</div>
    <section className="metrics-grid materials-metrics">{counts.map(([status, count]) => <Metric key={status} label={status} value={count} note="solicitações fictícias" tone={status === 'Aguardando aprovação' ? 'warn-top' : status === 'Entrega parcial' ? 'danger-top' : ''} />)}</section>
    <section className="panel materials-panel"><div className="panel-title"><div><p className="overline">REGISTROS VINCULADOS À OBRA</p><h2>Solicitações e entregas</h2></div>{canCreate && <button className="button primary" onClick={openRequestForm}>＋ Nova solicitação</button>}</div>
      <div className="filters materials-filters"><input className="input" aria-label="Buscar material" placeholder="Buscar item, fornecedor ou obra" value={query} onChange={(event) => setQuery(event.target.value)} /><select className="input" aria-label="Filtrar por obra" value={workFilter} onChange={(event) => setWorkFilter(event.target.value)}><option value="all">Todas as obras</option>{works.map((work) => <option key={work.id} value={work.id}>{work.name}</option>)}</select></div>
      {notice && <p className="planner-live" role="status">{notice}</p>}
      {query && !visible.length ? <div className="planner-empty-inline"><p>Nenhuma solicitação corresponde à busca.</p></div> : <div className="materials-work-list">
        {workGroups.map(({ work, phases }) => <section className="materials-work-group" key={work.id}>
          <header><p className="overline">{work.code || work.id} · OBRA</p><h3>{work.name}</h3><p>{work.location}</p></header>
          {phases.length ? phases.map(([phaseName, phaseRecords]) => <section className="materials-stage-group" key={phaseName}>
            <h4>Etapa · {phaseName}</h4>
            <div className="materials-list">{phaseRecords.map((record) => <article className="panel material-card" key={record.id}>
              <div className="material-card-head"><div><p className="overline">{record.demo ? 'DEMONSTRAÇÃO' : 'SOLICITAÇÃO'}</p><h3>{record.item}</h3></div><div className="material-statuses"><Status>{record.status}</Status><Status>{deliveryStatus(record)}</Status></div></div>
              <div className="material-facts"><span><small>QUANTIDADE</small><b>{record.quantity} {record.unit}</b></span><span><small>ETAPA</small><b>{record.phaseName || record.activity || 'Sem etapa vinculada'}</b></span><span><small>RESPONSÁVEL</small><b>{record.responsible || 'Não informado'}</b></span><span><small>PREVISÃO DE ENTREGA</small><b>{record.dueDate ? formatDate(record.dueDate) : 'Não informada'}</b></span></div>
              <label className={`material-delivered ${record.delivered ? 'is-delivered' : ''}`}><input type="checkbox" checked={Boolean(record.delivered)} disabled={!canRegisterDelivery || !['Pedido emitido', 'Entrega parcial', 'Recebido'].includes(record.status)} aria-label={`Entregue: ${record.item}`} onChange={(event) => toggleDelivered(record, event.target.checked)} /> Entregue{record.deliveredAt ? ` · ${formatDate(record.deliveredAt)}` : ''}</label>
              <p className="material-justification"><b>Justificativa:</b> {record.justification}</p>
              <div className="material-purchase"><span><small>FORNECEDOR / COTAÇÃO</small><b>{record.supplier || 'Ainda não informado'}</b></span>{canSeeValues && <span><small>VALOR FICTÍCIO</small><b>{record.value == null ? 'Não informado' : brl(record.value)}</b></span>}{record.evidence?.length > 0 && <span><small>EVIDÊNCIAS</small><b>{record.evidence.join(', ')}</b></span>}</div>
              {canManageFlow && record.status === 'Cotação' && <form className="material-quote-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const supplier = String(data.get('supplier') || '').trim(); const value = Number(data.get('value')); if (!supplier || !Number.isFinite(value) || value < 0) return; update(record.id, { supplier, value }, 'Cotação salva na demonstração.') }}><label>Fornecedor da cotação<input name="supplier" required maxLength="120" defaultValue={record.supplier || ''} /></label><label>Valor cotado (R$)<input name="value" type="number" required min="0" step="0.01" defaultValue={record.value ?? ''} /></label><button className="button secondary small" type="submit">Salvar cotação</button></form>}
              <div className="material-actions"><label className="material-status-select">Status<select className="input" aria-label={`Status do material: ${record.item}`} value={record.status} disabled={!canManageFlow} onChange={(event) => changeStatus(record, event.target.value)}><optgroup label="Orçamento"><option value="Solicitação">Solicitação</option><option value="Cotação">Cotação</option></optgroup><optgroup label="Aprovação"><option value="Aguardando aprovação">Aguardando aprovação</option></optgroup><optgroup label="Compras"><option value="Pedido emitido">Pedido emitido</option><option value="Entrega parcial">Entrega parcial</option><option value="Recebido">Recebido</option></optgroup></select></label>{field && ['Pedido emitido', 'Entrega parcial'].includes(record.status) && <label className="button secondary small material-file">＋ Registrar recebimento<input type="file" aria-label={`Registrar recebimento: ${record.item}`} onChange={(event) => { const names = Array.from(event.target.files || []).map((file) => file.name); if (names.length) update(record.id, { status: 'Recebido', delivered: true, deliveredAt: today, evidence: [...(record.evidence || []), ...names] }, 'Recebimento registrado na demonstração.') }} /></label>}</div>
            </article>)}</div>
          </section>) : <p className="materials-stage-empty">Esta obra ainda não tem solicitações de materiais.</p>}
        </section>)}
      </div>}
    </section>
    <p className="notice">{profile === 'requester' ? 'Área solicitante: consulta de materiais sem valores financeiros.' : profile === 'finance' ? 'Financeiro: consulta de pedidos, fornecedores e valores fictícios.' : profile === 'director' ? 'Diretoria: leitura dos registros e valores demonstrativos.' : profile === 'contractor' ? 'Empreiteiro: solicita materiais e registra recebimentos atribuídos; não aprova compras.' : profile === 'fiscal' ? 'Fiscal: registra necessidades e evidências de recebimento; não aprova cotação.' : 'Gerência: administra o fluxo demonstrativo de cotação até recebimento.'}</p>
    {creating && <div className="work-form-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreating(false) }}><form className="work-form panel materials-form" role="dialog" aria-modal="true" aria-labelledby="material-form-title" onSubmit={saveRequest}><div className="panel-title"><div><p className="overline">COMPRAS E MATERIAIS</p><h2 id="material-form-title">Nova solicitação</h2><p className="subtitle">A solicitação será salva somente neste navegador.</p></div><button type="button" className="icon-button" aria-label="Fechar" onClick={() => setCreating(false)}>×</button></div><div className="materials-form-grid"><label>Obra *<select className="input" name="workId" required value={formWorkId} onChange={(event) => setFormWorkId(event.target.value)}>{works.map((work) => <option key={work.id} value={work.id}>{work.name}</option>)}</select></label><label>Etapa / fase *<select className="input" name="phaseId" required defaultValue=""><option value="">{schedules[formWorkId]?.phases?.some((phase) => !phase.archived) ? 'Selecione uma etapa' : 'Esta obra ainda não tem etapas'}</option>{(schedules[formWorkId]?.phases || []).filter((phase) => !phase.archived).map((phase) => <option key={phase.id} value={phase.id}>{phase.name}</option>)}</select>{!schedules[formWorkId]?.phases?.some((phase) => !phase.archived) && <small className="materials-stage-hint">Cadastre etapas em Execução para vincular o material ao cronograma.</small>}</label><label>Item / material *<input className="input" name="item" required maxLength="140" autoFocus /></label><label>Quantidade *<input className="input" name="quantity" type="number" min="0.01" step="0.01" required /></label><label>Unidade<input className="input" name="unit" maxLength="30" placeholder="unidades, kg, metros…" /></label><label>Responsável *<input className="input" name="responsible" required maxLength="100" /></label><label>Previsão de entrega *<input className="input" name="dueDate" type="date" required /></label><label className="materials-justification">Justificativa *<textarea className="input" name="justification" required maxLength="600" rows="3" /></label></div><div className="work-form-actions"><button type="button" className="button secondary" onClick={() => setCreating(false)}>Cancelar</button><button className="button primary" type="submit">Salvar solicitação</button></div></form></div>}
  </>
}

function Approvals({ initialId, works, navigate }) {
  const [records, setRecords] = useState(loadMaterials)
  const [profile, setProfile] = useState('manager')
  const [view, setView] = useState('pending')
  const [notice, setNotice] = useState('')
  const canSeeValues = profile === 'manager' || profile === 'director' || profile === 'finance'
  const save = (next, message) => {
    setRecords(next)
    try { localStorage.setItem(materialsKey, JSON.stringify(next)); setNotice(message) }
    catch { setNotice('Não foi possível salvar no navegador. A alteração ficará disponível somente nesta sessão.') }
  }
  const updateApproval = (id, change, message) => save(records.map((record) => record.id === id ? { ...record, approval: { status: 'Aguardando ação', ...(record.approval || {}), ...change } } : record), message)
  const decide = (record, decision) => {
    const note = document.getElementById(`approval-note-${record.id}`)?.value.trim() || ''
    if (decision !== 'Aprovada' && !note) { setNotice('Escreva o motivo antes de devolver ou rejeitar o material.'); document.getElementById(`approval-note-${record.id}`)?.focus(); return }
    const now = new Date().toISOString()
    const next = records.map((item) => item.id !== record.id ? item : {
      ...item,
      status: decision === 'Aprovada' ? 'Aprovada' : decision === 'Devolvida' ? 'Cotação' : 'Rejeitada',
      approval: { ...(item.approval || {}), status: decision, note, decidedBy: profile, decidedAt: now, history: [...(item.approval?.history || []), { decision, note, decidedBy: profile, decidedAt: now }] },
    })
    save(next, `Material ${decision.toLocaleLowerCase('pt-BR')} na demonstração.`)
  }
  const pending = records.filter((record) => record.status === 'Aguardando aprovação' && (record.approval?.status || 'Aguardando ação') === 'Aguardando ação')
  const completed = records.filter((record) => ['Aprovada', 'Devolvida', 'Rejeitada'].includes(record.approval?.status))
  const allowed = (record) => profile === 'manager' || profile === 'director' || profile === 'finance' || record.approval?.assignedRole === profile || record.approval?.requesterRole === profile
  const visible = (view === 'pending' ? pending : completed).filter(allowed)
  const workGroups = [...new Set(visible.map((record) => record.workId))].map((workId) => ({ work: works.find((item) => item.id === workId), records: visible.filter((record) => record.workId === workId) }))
  useEffect(() => { if (initialId) document.getElementById(`approval-${initialId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [initialId])
  return <>
    <Header eyebrow="TAREFAS · MATERIAIS" title="Aprovações" subtitle="Revise cotações de materiais, registre a decisão e acompanhe o histórico." action={<button className="button secondary" onClick={() => navigate('materials')}>Abrir Materiais</button>} />
    <div className="planner-local-notice"><b>Demonstração local.</b> Decisões e responsáveis ficam neste navegador. Os perfis simulam acesso e não substituem permissões reais.</div>
    <div className="planner-toolbar materials-toolbar"><label>Perfil de demonstração<select className="input" value={profile} onChange={(event) => { setProfile(event.target.value); setNotice('') }}>{approvalProfiles.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label></div>
    <section className="metrics-grid materials-metrics"><Metric label="Aguardando decisão" value={pending.filter(allowed).length} note="materiais fictícios" tone="warn-top" /><Metric label="Concluídas" value={completed.filter(allowed).length} note="com histórico" tone="success-top" /></section>
    <div className="planner-switch" role="tablist" aria-label="Fila de aprovações"><button type="button" role="tab" aria-selected={view === 'pending'} className={view === 'pending' ? 'active' : ''} onClick={() => setView('pending')}>Aguardando minha ação</button><button type="button" role="tab" aria-selected={view === 'completed'} className={view === 'completed' ? 'active' : ''} onClick={() => setView('completed')}>Concluídas</button></div>
    {notice && <p className="planner-live" role="status">{notice}</p>}
    <section className="approval-material-list" aria-label="Tarefas de aprovação de materiais">
      {visible.length ? workGroups.map(({ work, records: workRecords }) => <section className="approval-work-group" key={work?.id || 'sem-obra'}>
        <header><p className="overline">{work?.code || work?.id || 'OBRA'} · OBRA</p><h2>{work?.name || 'Obra não identificada'}</h2><p>{work?.location || 'Local não informado'} · {workRecords.length} {workRecords.length === 1 ? 'aprovação' : 'aprovações'}</p></header>
        <div className="approval-work-cards">{workRecords.map((record) => {
        const work = works.find((item) => item.id === record.workId)
        const approval = record.approval || {}
        const canAssign = profile === 'manager' && view === 'pending'
        const canDecide = approval.assignedRole === profile && view === 'pending'
        const canApprove = (profile === 'manager' || profile === 'director') && view === 'pending'
        const result = approval.status || 'Aguardando ação'
        return <article className={`panel approval-material-card ${record.id === initialId ? 'is-target' : ''}`} id={`approval-${record.id}`} key={record.id}>
          <div className="material-card-head"><div><p className="overline">{record.demo ? 'DEMONSTRAÇÃO · TAREFA DE MATERIAL' : 'TAREFA DE MATERIAL'}</p><h2>{record.item}</h2><p>{work?.name || 'Obra'} · {record.phaseName || record.activity || 'Etapa não informada'}</p></div><Status>{result}</Status></div>
          <div className="approval-material-facts"><span><small>QUANTIDADE</small><b>{record.quantity} {record.unit}</b></span><span><small>SOLICITANTE</small><b>{record.responsible || 'Não informado'}</b></span><span><small>PRAZO</small><b>{record.dueDate ? formatDate(record.dueDate) : 'Não informado'}</b></span><span><small>ÁREA APROVADORA</small><b>{approval.area || 'Não definida'}</b></span></div>
          <p className="material-justification"><b>Justificativa:</b> {record.justification || 'Não informada'}</p>
          <div className="material-purchase"><span><small>FORNECEDOR</small><b>{record.supplier || 'Não informado'}</b></span>{canSeeValues && <span><small>VALOR FICTÍCIO</small><b>{record.value == null ? 'Não informado' : brl(record.value)}</b></span>}<span><small>RESPONSÁVEL ATUAL</small><b>{approval.assignedTo || 'A definir'}</b></span><span><small>EVIDÊNCIAS</small><b>{record.evidence?.length ? record.evidence.join(', ') : 'Nenhuma anexada'}</b></span></div>
          {canAssign && view === 'pending' && <div className="approval-assignment"><label>Área responsável<select className="input" value={approval.assignedRole || 'fiscal'} onChange={(event) => updateApproval(record.id, { assignedRole: event.target.value, area: approvalProfiles.find(([id]) => id === event.target.value)?.[1] || '', assignedTo: planningPeople[0] }, 'Responsável atualizado na demonstração.')}>{approvalProfiles.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>Responsável<select className="input" value={approval.assignedTo || planningPeople[0]} onChange={(event) => updateApproval(record.id, { assignedTo: event.target.value }, 'Responsável atualizado na demonstração.')}>{planningPeople.map((person) => <option key={person}>{person}</option>)}</select></label></div>}
          {approval.history?.length > 0 && <div className="approval-history"><b>Histórico</b>{approval.history.map((entry, index) => <p key={`${entry.decidedAt}-${index}`}>{entry.decision} · {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(entry.decidedAt))}{entry.note ? ` · ${entry.note}` : ''}</p>)}</div>}
          {view === 'pending' && <><label className="planner-field">Observação da decisão<textarea id={`approval-note-${record.id}`} rows="2" maxLength="500" placeholder="Obrigatória para reprovar ou devolver" /></label><div className="planner-modal-actions approval-actions"><button type="button" className="button primary" disabled={!canApprove} onClick={() => decide(record, 'Aprovada')}>Aprovar material</button><button type="button" className="button secondary danger-text" disabled={!canApprove} onClick={() => decide(record, 'Rejeitada')}>Reprovar material</button>{canDecide && <button type="button" className="button secondary" onClick={() => decide(record, 'Devolvida')}>Devolver para ajuste</button>}</div>{!canApprove && <p className="notice">Somente Gerência de Infraestrutura e Diretoria podem aprovar ou reprovar materiais. O responsável atribuído pode devolvê-los para ajuste.</p>}</>}
        </article>
      })}</div>
      </section>) : <article className="panel planner-empty-inline"><p>{view === 'pending' ? 'Não há tarefas de materiais aguardando sua ação.' : 'Ainda não há decisões concluídas nesta demonstração.'}</p></article>}
    </section>
  </>
}

function Finance({ works }) {
  const rows = [['CAPEX aprovado', financial.capex], ['Contratado', financial.contracted], ['Medido', financial.measured], ['Pago', financial.paid], ['Saldo contratado', financial.contracted - financial.paid]]
  const details = works.map((work) => ({ work, breakdown: financialByWork[work.id] }))
  const detailed = details.filter(({ breakdown }) => breakdown)
  const sum = (list, getValue) => list.reduce((total, item) => total + getValue(item), 0)
  const category = (name) => ({
    total: sum(detailed, ({ breakdown }) => breakdown[name].total),
    paid: sum(detailed, ({ breakdown }) => breakdown[name].paid),
  })
  const materials = category('materials')
  const labor = category('labor')
  const totals = { total: materials.total + labor.total, paid: materials.paid + labor.paid }
  const physical = getPlanningNumbers(works.find((work) => work.id === 'DEMO-01') || works[0])
  return <>
    <Header eyebrow="CARTEIRA · MATERIAIS · MÃO DE OBRA" title="Financeiro" subtitle="Valores globais e pagamentos separados por obra e categoria." action={<span className="demo-pill">VALORES FICTÍCIOS</span>} />
    <div className="planner-local-notice"><b>Demonstração local.</b> O consolidado global da carteira é demonstrativo; a divisão por categoria abaixo cobre as obras que têm detalhamento cadastrado.</div>
    <section className="metrics-grid finance-global-metrics">{rows.map(([label, value]) => <Metric key={label} label={label} value={brl(value)} note="Global · demonstração" />)}</section>
    <section className="panel finance-global-breakdown"><div className="panel-title"><div><p className="overline">GLOBAL · {detailed.length} OBRAS COM COMPOSIÇÃO</p><h2>Materiais e mão de obra</h2></div></div><div className="finance-breakdown-row finance-breakdown-heading"><span>Categoria</span><span>Valor previsto</span><span>Pago</span><span>Saldo</span></div>{[['Materiais', materials], ['Mão de obra', labor], ['Total detalhado', totals]].map(([label, values]) => <div className="finance-breakdown-row" key={label}><b>{label}</b><span>{brl(values.total)}</span><span>{brl(values.paid)}</span><strong>{brl(values.total - values.paid)}</strong></div>)}</section>
    <section className="finance-work-list" aria-label="Resumo financeiro por obra"><div className="panel-title"><div><p className="overline">DETALHAMENTO POR OBRA</p><h2>Valores, pagamentos e saldos</h2></div></div>{details.map(({ work, breakdown }) => {
      const workTotal = work.totalValue ?? (breakdown ? breakdown.materials.total + breakdown.labor.total : null)
      const workPaid = work.paidValue ?? (breakdown ? breakdown.materials.paid + breakdown.labor.paid : null)
      return <article className="panel finance-work-card" key={work.id}><div className="finance-work-heading"><div><p className="overline">{work.code || work.id} · {work.phase}</p><h3>{work.name}</h3><small>{work.location}</small></div><Status>{work.status}</Status></div><div className="finance-work-categories">{[['Materiais', breakdown?.materials], ['Mão de obra', breakdown?.labor], ['Total da obra', null]].map(([label, values]) => {
        const total = values?.total ?? (label === 'Total da obra' ? workTotal : null)
        const paid = values?.paid ?? (label === 'Total da obra' ? workPaid : null)
        return <div className="finance-work-category" key={label}><b>{label}</b><span><small>Previsto</small><strong>{total == null ? 'Não informado' : brl(total)}</strong></span><span><small>Pago</small><strong>{paid == null ? 'Não informado' : brl(paid)}</strong></span><span><small>Saldo</small><strong>{total == null || paid == null ? 'Não informado' : brl(total - paid)}</strong></span></div>
      })}</div></article>
    })}</section>
    <section className="columns"><article className="panel"><div className="panel-title"><div><p className="overline">CTCH · EXEMPLO</p><h2>Resumo do contrato</h2></div></div><div className="detail-stats two"><div><span>Valor total da obra</span><b>{brl(financial.demoTotal)}</b><small>Fictício</small></div><div><span>Custo medido</span><b>{brl(financial.demoMeasured)} · 48%</b><small>Base demonstrativa</small></div><div><span>Em análise</span><b>{brl(financial.pendingMeasurement)}</b><small>Medição 04</small></div><div><span>Saldo do contrato</span><b>{brl(504800)}</b><small>Fictício</small></div></div></article><article className="panel"><div className="panel-title"><div><p className="overline">COMPARAÇÃO</p><h2>Físico × financeiro</h2></div></div><div className="compare"><span>Avanço físico <b>{physical.actual === null ? '—' : `${physical.actual}%`}</b></span><Bar value={physical.actual ?? 0} /><span>Custo medido <b>48%</b></span><Bar value={48} amber /><p>Diferença demonstrativa: <b className="amber-text">{physical.actual === null ? '—' : `${(physical.actual - 48).toFixed(1)} p.p.`}</b>. A base final do indicador será definida no PRD-BACKEND.</p></div></article></section>
    <article className="panel"><div className="panel-title"><div><p className="overline">EVIDÊNCIAS ANTES DA APROVAÇÃO</p><h2>Medições recentes</h2></div><button className="button primary" onClick={() => window.alert('Prévia: medição não criada.')}>＋ Nova medição</button></div><div className="table-scroll"><table><thead><tr><th>Medição / obra</th><th>Fornecedor</th><th>Valor demo</th><th>Evidências</th><th>Status</th></tr></thead><tbody><tr><td><b>Medição 04 · CTCH</b><small>Execução civil</small></td><td>Construtora Horizonte · demo</td><td>{brl(financial.pendingMeasurement)}</td><td>3 anexos</td><td><Status>Em análise</Status></td></tr><tr><td><b>Medição 03 · CTCH</b><small>Instalações</small></td><td>Instalações Paraná · demo</td><td>{brl(124800)}</td><td>5 anexos</td><td><Status>Aprovada</Status></td></tr><tr><td><b>Medição 02 · CME</b><small>Projetos</small></td><td>Engenharia Sul · demo</td><td>{brl(42600)}</td><td>1 anexo</td><td><Status>Atrasada</Status></td></tr></tbody></table></div></article>
  </>
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const [selectedApprovalId, setSelectedApprovalId] = useState('')
  const [workList, setWorkList] = useState(loadWorks)
  const [people, setPeople] = useState(loadPlanningPeople)
  const [workSaveNotice, setWorkSaveNotice] = useState('')
  useEffect(() => { try { localStorage.setItem(peopleKey, JSON.stringify(people)) } catch { setWorkSaveNotice('Não foi possível salvar o cadastro de responsáveis neste navegador.') } }, [people])
  const persistWorkOwners = (next) => {
    setWorkList(next)
    try { localStorage.setItem(worksStorageKey, JSON.stringify(next.filter((item) => !item.demo))) }
    catch { setWorkSaveNotice('As atribuições foram atualizadas nesta sessão, mas não foi possível salvá-las no navegador.') }
  }
  const renameResponsible = (oldName, newName) => {
    setPeople((current) => current.map((name) => name === oldName ? newName : name))
    persistWorkOwners(updateWorkOwners(workList, oldName, newName))
    try { localStorage.setItem(plannerKey, JSON.stringify(updateResponsibleAssignments(loadPlanning(), oldName, newName))) }
    catch { setWorkSaveNotice('O nome mudou, mas não foi possível salvar todas as atribuições no navegador.') }
  }
  const deleteResponsible = (name) => {
    setPeople((current) => current.filter((person) => person !== name))
    persistWorkOwners(updateWorkOwners(workList, name, ''))
    try { localStorage.setItem(plannerKey, JSON.stringify(updateResponsibleAssignments(loadPlanning(), name, ''))) }
    catch { setWorkSaveNotice('O responsável foi removido nesta sessão, mas não foi possível salvar todas as alterações.') }
  }
  const addResponsible = (name) => setPeople((current) => current.includes(name) ? current : [...current, name])
  const addWork = (work) => {
    const next = [work, ...workList]
    setWorkList(next)
    try {
      localStorage.setItem(worksStorageKey, JSON.stringify(next.filter((item) => !item.demo)))
      localStorage.setItem(workStatusesKey, JSON.stringify(Object.fromEntries(next.map((item) => [item.id, item.workflowStatus || defaultWorkStatus(item)]))))
      setWorkSaveNotice('Obra cadastrada e salva neste navegador.')
    } catch {
      setWorkSaveNotice('Não foi possível salvar no navegador. A obra ficará disponível somente nesta sessão.')
    }
  }
  const changeWorkStatus = (workId, workflowStatus) => {
    const next = workList.map((work) => work.id === workId ? { ...work, workflowStatus } : work)
    setWorkList(next)
    try {
      localStorage.setItem(worksStorageKey, JSON.stringify(next.filter((item) => !item.demo)))
      localStorage.setItem(workStatusesKey, JSON.stringify(Object.fromEntries(next.map((item) => [item.id, item.workflowStatus || defaultWorkStatus(item)]))))
      setWorkSaveNotice('Status atualizado e salvo neste navegador.')
    } catch {
      setWorkSaveNotice('Não foi possível salvar o status no navegador. A alteração ficará disponível somente nesta sessão.')
    }
  }
  const navigate = (next, approvalId = '') => { setPage(next); setSelectedApprovalId(approvalId); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const content = page === 'works' ? <Works works={workList} onCreate={addWork} onStatusChange={changeWorkStatus} saveNotice={workSaveNotice} people={people} onAddPerson={addResponsible} onRenamePerson={renameResponsible} onDeletePerson={deleteResponsible} /> : page === 'execution' ? <Execution works={workList} people={people} onAddPerson={addResponsible} onRenamePerson={renameResponsible} onDeletePerson={deleteResponsible} /> : page === 'materials' ? <Materials works={workList} /> : page === 'approvals' ? <Approvals initialId={selectedApprovalId} works={workList} navigate={navigate} /> : page === 'finance' ? <Finance works={workList} /> : <Dashboard navigate={navigate} works={workList} />
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">C</span><span><b>CODEX</b><small>GESTÃO DE OBRAS</small></span></div><p className="nav-caption">CARTEIRA HOSPITALAR</p>{menu.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}<div className="sidebar-user"><span className="avatar">RL</span><span><b>Rafael Lessa</b><small>Gerente · demonstração</small></span></div></aside><main className="main"><header className="topbar"><div>Hospital São Vicente <span>/</span> <b>{title[page]}</b></div><span className="demo-label">DADOS DE DEMONSTRAÇÃO</span></header><div className="content">{content}</div></main><nav className="bottom-nav" aria-label="Navegação principal no celular">{menu.map((item) => <button key={item.id} className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}</nav></div>
}
