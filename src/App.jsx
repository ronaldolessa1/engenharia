import { useState } from 'react'
import { activities, approvals, brl, financial, works } from './lib/mockData.js'

const menu = [
  { id: 'dashboard', label: 'Painel', icon: '▦' },
  { id: 'works', label: 'Obras', icon: '⌂' },
  { id: 'execution', label: 'Execução', icon: '▤' },
  { id: 'approvals', label: 'Aprovações', icon: '✓' },
  { id: 'finance', label: 'Financeiro', icon: 'R$' },
]
const title = Object.fromEntries(menu.map((item) => [item.id, item.label]))
const statusTone = (status) => status === 'Atrasada' || status === 'Paralisada' ? 'danger' : status === 'Atenção' || status === 'Aguardando' || status === 'Em andamento' ? 'warn' : status === 'Dentro do prazo' || status === 'Concluída' || status === 'Aprovada' ? 'success' : 'neutral'

function Status({ children }) { return <span className={`status ${statusTone(children)}`}><i />{children}</span> }
function Bar({ value, amber = false }) { return <div className={amber ? 'bar amber' : 'bar'}><i style={{ width: `${value}%` }} /></div> }
function Header({ eyebrow, title: heading, subtitle, action }) { return <header className="page-head"><div><p className="overline">{eyebrow}</p><h1>{heading}</h1><p className="subtitle">{subtitle}</p></div>{action}</header> }
function Metric({ label, value, note, tone = '' }) { return <article className={`metric-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></article> }

function Dashboard({ navigate }) {
  const main = works[0]
  return <>
    <Header eyebrow="CARTEIRA DE INFRAESTRUTURA" title="Painel de obras" subtitle="Avanço da obra e custo acumulado, com os pontos que pedem sua atenção." action={<button className="button primary" onClick={() => navigate('works')}>＋ Ver carteira</button>} />
    <section className="focus-grid">
      <article className="focus-card dark"><span>CTCH · AVANÇO FÍSICO</span><strong>{main.progress}<small>%</small></strong><Bar value={main.progress} /><div className="split-note"><span>Previsto {main.planned}%</span><b>Realizado {main.progress}% · {main.planned - main.progress} p.p. atrás</b></div></article>
      <article className="focus-card"><span>CUSTO MEDIDO · % DO VALOR TOTAL</span><strong>{main.cost}<small>%</small></strong><Bar value={main.cost} amber /><div className="split-note"><span>{brl(financial.demoMeasured)} medidos</span><b>de {brl(financial.demoTotal)}</b></div></article>
      <article className="focus-card"><span>DIFERENÇA FÍSICO × FINANCEIRO</span><strong className="amber-text">+{main.progress - main.cost}<small> p.p.</small></strong><p>O avanço físico está acima do custo medido neste exemplo.</p><Status>Atenção</Status></article>
    </section>
    <section className="metrics-grid"><Metric label="Obras em andamento" value="11" note="de 15 na carteira fictícia" /><Metric label="Obras atrasadas" value="3" note="1 atividade paralisada" tone="danger-top" /><Metric label="Aguardando aprovação" value="6" note="em 4 obras" tone="warn-top" /><Metric label="Dentro do prazo" value="8" note="próxima entrega nesta semana" tone="success-top" /></section>
    <section className="columns">
      <article className="panel"><div className="panel-title"><div><p className="overline">ACOMPANHAMENTO</p><h2>Carteira · onde atuar</h2></div><button className="text-button" onClick={() => navigate('works')}>VER TODAS →</button></div><div className="table-scroll"><table><thead><tr><th>Obra / etapa</th><th>Status</th><th>Avanço</th><th>Custo</th><th>Próxima atividade</th></tr></thead><tbody>{works.slice(0, 4).map((work) => <tr key={work.id} onClick={() => navigate('works')}><td><b>{work.name}</b><small>{work.phase} · {work.location}</small></td><td><Status>{work.status}</Status></td><td><b>{work.progress}%</b></td><td>{work.cost}%</td><td>{work.next}</td></tr>)}</tbody></table></div></article>
      <article className="panel"><div className="panel-title"><div><p className="overline">FILA DO GESTOR</p><h2>Precisa da sua atenção</h2></div><button className="text-button" onClick={() => navigate('approvals')}>ABRIR →</button></div><div className="attention-list">{approvals.map((item) => <button className="attention" key={item.title} onClick={() => navigate('approvals')}><i /><span><b>{item.title}</b><small>{item.work} · {item.area}</small></span><Status>{item.status}</Status></button>)}<button className="attention" onClick={() => navigate('execution')}><i className="red-dot" /><span><b>Concretagem da laje 2</b><small>Ala Norte · Marcos Dias · 4 dias</small></span><Status>Atrasada</Status></button></div></article>
    </section>
    <section className="financial-strip">{[['CAPEX aprovado', financial.capex], ['Contratado', financial.contracted], ['Medido', financial.measured], ['Pago', financial.paid]].map(([label, value]) => <div key={label}><span>{label}</span><b>{brl(value)}</b></div>)}</section>
  </>
}

function Works() {
  const [selected, setSelected] = useState(works[0])
  return <>
    <Header eyebrow="CARTEIRA HOSPITALAR" title="Obras e projetos" subtitle="Cada obra tem seu próprio cronograma, equipe e histórico." action={<button className="button primary" onClick={() => window.alert('Prévia: cadastro de obra ainda não conectado.')}>＋ Nova obra</button>} />
    <div className="filters"><input className="input" placeholder="Buscar obra ou local" aria-label="Buscar obra" /><select className="input"><option>Todas as fases</option><option>Execução</option><option>Projetos</option><option>Entrega</option></select><select className="input"><option>Todos os status</option><option>Atrasada</option><option>Dentro do prazo</option></select></div>
    <section className="works-layout"><div className="work-list">{works.map((work) => <button className={`work-card ${selected.id === work.id ? 'chosen' : ''}`} key={work.id} onClick={() => setSelected(work)}><span className="work-card-title"><b>{work.name}</b><Status>{work.status}</Status></span><small>{work.id} · {work.phase} · {work.location}</small><span className="split-note"><span>Avanço físico</span><b>{work.progress}%</b></span><Bar value={work.progress} /></button>)}</div><article className="panel detail"><div className="panel-title"><div><p className="overline">{selected.id} · DEMONSTRAÇÃO</p><h2>{selected.name}</h2><p className="subtitle">Hospital São Vicente · {selected.location}</p></div><Status>{selected.status}</Status></div><div className="detail-stats"><div><span>Avanço físico</span><b>{selected.progress}%</b><small>Previsto {selected.planned}%</small></div><div><span>Custo medido</span><b>{selected.cost}%</b><small>Base demo</small></div><div><span>Responsável</span><b className="person">{selected.owner}</b><small>Equipe cadastrada</small></div></div><div className="detail-block"><span>PRÓXIMA ATIVIDADE</span><b>{selected.next}</b><small>Prazo demonstrativo</small></div><div className="detail-block"><span>EQUIPE DA OBRA</span><b>{selected.owner} · Engenharia / fiscalização</b><small>Responsáveis podem ser adicionados a partir do cadastro.</small></div></article></section>
  </>
}

function Execution() {
  return <>
    <Header eyebrow="REGISTRO DE CAMPO · CTCH" title="Execução e diário" subtitle="Apontamentos demonstrativos vinculados à obra e às atividades." action={<button className="button primary" onClick={() => window.alert('Prévia: diário não foi enviado.')}>＋ Registrar diário</button>} />
    <div className="filters"><select className="input"><option>CTCH · Demonstração</option><option>Posto assistencial · Ala Norte</option></select><button className="button secondary">Hoje · demonstração</button></div>
    <section className="columns execution-columns"><article className="panel"><div className="panel-title"><div><p className="overline">EAP · ESTRUTURA ANALÍTICA</p><h2>Atividades da obra</h2></div></div>{activities.map((activity) => <div className="activity" key={activity.name}><Status>{activity.status}</Status><div><b>{activity.name}</b><small>{activity.owner} · {activity.due}</small><Bar value={activity.progress} /></div><strong>{activity.progress}%</strong></div>)}</article><article className="panel"><div className="panel-title"><div><p className="overline">DATA ILUSTRATIVA</p><h2>Diário de hoje</h2></div><Status>DEMO</Status></div><dl className="daily"><dt>Obra</dt><dd>CTCH · Centro de Tratamento Cirúrgico</dd><dt>Atividade</dt><dd>Compatibilização de gases · 72%</dd><dt>Equipe</dt><dd>6 pessoas · exemplo</dd><dt>Material</dt><dd>Tubulação de cobre · exemplo</dd><dt>Ocorrência</dt><dd>Aguardando liberação da área para a próxima etapa.</dd></dl><div className="photo-box">＋ &nbsp; Fotografias vinculadas à atividade</div><button className="button primary full" onClick={() => window.alert('Prévia: registro não foi enviado.')}>Salvar diário de demonstração</button></article></section>
  </>
}

function Approvals() {
  return <>
    <Header eyebrow="VALIDAÇÕES MULTIDISCIPLINARES" title="Aprovações" subtitle="Fila de exemplo com responsável, prazo e etapa visíveis." />
    <section className="metrics-grid"><Metric label="Aguardando minha ação" value="3" note="exemplos pendentes" /><Metric label="Em análise" value="2" note="em duas obras" tone="warn-top" /><Metric label="Devolvidas" value="1" note="aguardando ajuste" tone="danger-top" /><Metric label="Concluídas no período" value="8" note="contagem demonstrativa" tone="success-top" /></section>
    <article className="panel"><div className="panel-title"><div><p className="overline">PRÓXIMAS DECISÕES</p><h2>Fila de aprovações</h2></div></div>{approvals.map((item) => <div className="approval-row" key={item.title}><span className="approval-check">✓</span><span><b>{item.title}</b><small>{item.work}</small></span><span><small>ÁREA RESPONSÁVEL</small><b>{item.area}</b></span><span><small>PRAZO</small><b>{item.due}</b></span><Status>{item.status}</Status><button className="button secondary small" onClick={() => window.alert('Prévia: decisão não foi registrada.')}>Abrir</button></div>)}</article>
    <p className="notice">Aprovações ainda não são persistidas. O PRD-BACKEND será necessário para definir permissões e histórico.</p>
  </>
}

function Finance() {
  const rows = [['CAPEX aprovado', financial.capex], ['Contratado', financial.contracted], ['Medido', financial.measured], ['Pago', financial.paid]]
  return <>
    <Header eyebrow="CAPEX · CONTRATOS · MEDIÇÕES" title="Financeiro" subtitle="Valores fictícios para demonstração; dados reais do CTCH não foram fornecidos." action={<span className="demo-pill">VALORES FICTÍCIOS</span>} />
    <section className="metrics-grid">{rows.map(([label, value]) => <Metric key={label} label={label} value={brl(value)} note="Demonstração" />)}</section>
    <section className="columns"><article className="panel"><div className="panel-title"><div><p className="overline">CTCH · EXEMPLO</p><h2>Resumo do contrato</h2></div></div><div className="detail-stats two"><div><span>Valor total da obra</span><b>{brl(financial.demoTotal)}</b><small>Fictício</small></div><div><span>Custo medido</span><b>{brl(financial.demoMeasured)} · 48%</b><small>Base demonstrativa</small></div><div><span>Em análise</span><b>{brl(financial.pendingMeasurement)}</b><small>Medição 04</small></div><div><span>Saldo do contrato</span><b>{brl(504800)}</b><small>Fictício</small></div></div></article><article className="panel"><div className="panel-title"><div><p className="overline">COMPARAÇÃO</p><h2>Físico × financeiro</h2></div></div><div className="compare"><span>Avanço físico <b>62%</b></span><Bar value={62} /><span>Custo medido <b>48%</b></span><Bar value={48} amber /><p>Diferença demonstrativa: <b className="amber-text">14 p.p.</b>. A base final do indicador será definida no PRD-BACKEND.</p></div></article></section>
    <article className="panel"><div className="panel-title"><div><p className="overline">EVIDÊNCIAS ANTES DA APROVAÇÃO</p><h2>Medições recentes</h2></div><button className="button primary" onClick={() => window.alert('Prévia: medição não criada.')}>＋ Nova medição</button></div><div className="table-scroll"><table><thead><tr><th>Medição / obra</th><th>Fornecedor</th><th>Valor demo</th><th>Evidências</th><th>Status</th></tr></thead><tbody><tr><td><b>Medição 04 · CTCH</b><small>Execução civil</small></td><td>Construtora Horizonte · demo</td><td>{brl(financial.pendingMeasurement)}</td><td>3 anexos</td><td><Status>Em análise</Status></td></tr><tr><td><b>Medição 03 · CTCH</b><small>Instalações</small></td><td>Instalações Paraná · demo</td><td>{brl(124800)}</td><td>5 anexos</td><td><Status>Aprovada</Status></td></tr><tr><td><b>Medição 02 · CME</b><small>Projetos</small></td><td>Engenharia Sul · demo</td><td>{brl(42600)}</td><td>1 anexo</td><td><Status>Atrasada</Status></td></tr></tbody></table></div></article>
  </>
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const navigate = (next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const content = page === 'works' ? <Works /> : page === 'execution' ? <Execution /> : page === 'approvals' ? <Approvals /> : page === 'finance' ? <Finance /> : <Dashboard navigate={navigate} />
  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">C</span><span><b>CODEX</b><small>GESTÃO DE OBRAS</small></span></div><p className="nav-caption">CARTEIRA HOSPITALAR</p>{menu.map((item) => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span>{item.label}</button>)}<div className="sidebar-user"><span className="avatar">RL</span><span><b>Rafael Lessa</b><small>Gerente · demonstração</small></span></div></aside><main className="main"><header className="topbar"><div>Hospital São Vicente <span>/</span> <b>{title[page]}</b></div><span className="demo-label">DADOS DE DEMONSTRAÇÃO</span></header><div className="content">{content}</div></main><nav className="bottom-nav" aria-label="Navegação principal no celular">{menu.map((item) => <button key={item.id} className={page === item.id ? 'active' : ''} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}</nav></div>
}
