// Dados fictícios de demonstração; não representam valores reais do CTCH.
export const works = [
  { id: 'DEMO-01', demo: true, name: 'CTCH · Centro de Tratamento Cirúrgico', location: 'Bloco cirúrgico', phase: 'Execução', status: 'Atenção', progress: 62, planned: 68, cost: 48, totalValue: 1240000, paidValue: 496000, next: 'Compatibilizar gases medicinais', owner: 'Ana Ribeiro', delay: 6 },
  { id: 'DEMO-02', demo: true, name: 'Central de Material Esterilizado', location: 'CME', phase: 'Projetos', status: 'Em análise', progress: 18, planned: 20, cost: 12, totalValue: 680000, paidValue: 81600, next: 'Revisão elétrica', owner: 'Paulo Lima', delay: 0 },
  { id: 'DEMO-03', demo: true, name: 'Posto assistencial · Ala Norte', location: 'Internação', phase: 'Execução', status: 'Atrasada', progress: 41, planned: 55, cost: 39, totalValue: 925000, paidValue: 342250, next: 'Receber material elétrico', owner: 'Marcos Dias', delay: 4 },
  { id: 'DEMO-04', demo: true, name: 'Quadros elétricos · Bloco C', location: 'Infraestrutura', phase: 'Execução', status: 'Paralisada', progress: 54, planned: 60, cost: 46, totalValue: 410000, paidValue: 184500, next: 'Aguardar componente', owner: 'Ana Ribeiro', delay: 0 },
  { id: 'DEMO-05', demo: true, name: 'Sanitários acessíveis · Bloco B', location: 'Bloco B', phase: 'Entrega', status: 'Dentro do prazo', progress: 96, planned: 92, cost: 91, totalValue: 295000, paidValue: 265500, next: 'Inspeção final', owner: 'Larissa Costa', delay: 0 },
]

export const activities = [
  { name: 'Proteção e isolamento da área', owner: 'Ricardo Alves', progress: 100, status: 'Concluída', due: 'Concluída ontem' },
  { name: 'Compatibilização de gases medicinais', owner: 'Ana Ribeiro + Paulo Lima', progress: 72, status: 'Em andamento', due: 'Prazo demonstrativo: hoje' },
  { name: 'Concretagem da laje 2', owner: 'Marcos Dias', progress: 38, status: 'Atrasada', due: 'Atraso demonstrativo: 4 dias' },
  { name: 'Instalação de luminárias cirúrgicas', owner: 'Responsáveis a definir', progress: 0, status: 'Não iniciada', due: 'Aguardando liberação' },
]

export const approvals = [
  { title: 'Revisão de projeto · gases medicinais', work: 'CTCH · Demonstração', area: 'Engenharia Clínica', due: 'Hoje', status: 'Aguardando' },
  { title: 'Medição 04 · execução civil', work: 'CTCH · Demonstração', area: 'Engenharia / Fiscalização', due: 'Hoje', status: 'Em análise' },
  { title: 'Especificação de luminárias', work: 'Ala Norte · Demonstração', area: 'Área assistencial', due: 'Amanhã', status: 'Aguardando' },
]

export const financial = { capex: 4800000, contracted: 3900000, measured: 2100000, paid: 1700000, demoTotal: 1240000, demoMeasured: 595200, pendingMeasurement: 86400 }
export const financialByWork = {
  'DEMO-01': { materials: { total: 400000, paid: 190000 }, labor: { total: 840000, paid: 306000 } },
  'DEMO-02': { materials: { total: 220000, paid: 26400 }, labor: { total: 460000, paid: 55200 } },
  'DEMO-03': { materials: { total: 350000, paid: 136900 }, labor: { total: 575000, paid: 205350 } },
  'DEMO-04': { materials: { total: 250000, paid: 112500 }, labor: { total: 160000, paid: 72000 } },
  'DEMO-05': { materials: { total: 170000, paid: 153000 }, labor: { total: 125000, paid: 112500 } },
}
export const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

export const planningPeople = ['Ana Ribeiro', 'Paulo Lima', 'Ricardo Alves', 'Marcos Dias', 'Larissa Costa', 'Juliana Prado']

export const planningDemo = {
  workId: 'DEMO-01',
  originalApprovedAt: '2026-11-01T12:00:00.000Z',
  phases: [
    { id: 'demo-phase-1', name: 'Preparação e isolamento', description: 'Preparar a área assistencial para execução.', weight: 20, start: '2026-11-03', end: '2026-11-09', owners: ['Ana Ribeiro'], archived: false, activities: [
      { id: 'demo-act-1', name: 'Isolamento do centro cirúrgico', description: 'Proteções e liberação da área.', weight: 100, start: '2026-11-03', end: '2026-11-09', owners: ['Ana Ribeiro', 'Ricardo Alves'], tasks: [
        { id: 'demo-task-1', name: 'Instalar barreiras e sinalização', weight: 60, start: '2026-11-03', end: '2026-11-05', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-05', executionDate: '2026-11-05', owners: ['Ricardo Alves'], observation: 'Demonstração: evidência registrada.', evidence: [] },
        { id: 'demo-task-2', name: 'Validar rota de acesso com a área assistencial', weight: 40, start: '2026-11-06', end: '2026-11-09', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-09', executionDate: '2026-11-08', owners: ['Ana Ribeiro'], observation: '', evidence: [] },
      ] },
    ] },
    { id: 'demo-phase-2', name: 'Demolição e infraestrutura', description: 'Serviços preparatórios da área.', weight: 20, start: '2026-11-10', end: '2026-11-13', owners: ['Marcos Dias'], archived: false, activities: [
      { id: 'demo-act-2', name: 'Remoção de revestimentos', description: 'Retirada e destinação dos materiais.', weight: 70, start: '2026-11-10', end: '2026-11-12', owners: ['Marcos Dias', 'Ricardo Alves'], tasks: [
        { id: 'demo-task-3', name: 'Isolar frente de serviço', weight: 25, start: '2026-11-10', end: '2026-11-10', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-10', executionDate: '2026-11-10', owners: ['Marcos Dias'], observation: '', evidence: [] },
        { id: 'demo-task-4', name: 'Retirar revestimento e conferir base', weight: 75, start: '2026-11-11', end: '2026-11-12', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-13', executionDate: '2026-11-12', owners: ['Marcos Dias', 'Ricardo Alves'], observation: '', evidence: [] },
      ] },
      { id: 'demo-act-3', name: 'Preparação das passagens técnicas', description: 'Conferência das aberturas previstas.', weight: 30, start: '2026-11-11', end: '2026-11-13', owners: ['Ana Ribeiro'], tasks: [
        { id: 'demo-task-5', name: 'Conferir interferências com os projetos', weight: 100, start: '2026-11-11', end: '2026-11-13', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-13', executionDate: '2026-11-12', owners: ['Ana Ribeiro'], observation: '', evidence: [] },
      ] },
    ] },
    { id: 'demo-phase-3', name: 'Instalações críticas', description: 'Execução e validação das instalações técnicas.', weight: 40, start: '2026-11-11', end: '2026-12-03', owners: ['Ana Ribeiro', 'Marcos Dias'], archived: false, activities: [
      { id: 'demo-act-4', name: 'Compatibilização de gases medicinais', description: 'Revisão de interferências e validação em campo.', weight: 40, start: '2026-11-11', end: '2026-11-21', owners: ['Ana Ribeiro', 'Paulo Lima'], tasks: [
        { id: 'demo-task-6', name: 'Conferir pontos e interferências do projeto', weight: 60, start: '2026-11-11', end: '2026-11-16', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-13', executionDate: '2026-11-13', owners: ['Ana Ribeiro'], observation: '', evidence: [] },
        { id: 'demo-task-7', name: 'Validar percurso com Engenharia Clínica', weight: 40, start: '2026-11-17', end: '2026-11-21', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-14', executionDate: '2026-11-14', owners: ['Paulo Lima'], observation: '', evidence: [] },
      ] },
      { id: 'demo-act-5', name: 'Alimentação elétrica dos equipamentos', description: 'Adequação elétrica ligada aos equipamentos assistenciais.', weight: 60, start: '2026-11-11', end: '2026-11-24', owners: ['Marcos Dias', 'Ana Ribeiro'], tasks: [
        { id: 'demo-task-8', name: 'Executar infraestrutura de alimentação', weight: 25, start: '2026-11-11', end: '2026-11-18', status: 'Concluída', requiresValidation: true, validatedAt: '2026-11-13', executionDate: '2026-11-12', owners: ['Marcos Dias'], observation: '', evidence: [] },
        { id: 'demo-task-9', name: 'Conferir aterramento e proteção', weight: 35, start: '2026-11-19', end: '2026-11-20', status: 'Em validação', requiresValidation: true, reportedProgress: 100, approvedProgress: 0, validatedAt: '', executionDate: '2026-11-14', owners: ['Marcos Dias'], observation: 'Demonstração: aguardando aceite do fiscal.', evidence: [] },
        { id: 'demo-task-10', name: 'Instalar alimentação do equipamento', weight: 40, start: '2026-11-11', end: '2026-11-12', status: 'Bloqueada', requiresValidation: true, validatedAt: '', executionDate: '', owners: ['Marcos Dias'], observation: 'Demonstração: aguardando liberação da área.', evidence: [] },
      ] },
    ] },
    { id: 'demo-phase-4', name: 'Acabamentos e comissionamento', description: 'Finalização, testes e entrega da área.', weight: 20, start: '2026-12-01', end: '2026-12-18', owners: ['Larissa Costa'], archived: false, activities: [
      { id: 'demo-act-6', name: 'Acabamentos da área assistencial', description: 'Recomposição e acabamento dos ambientes.', weight: 65, start: '2026-12-01', end: '2026-12-12', owners: ['Larissa Costa'], tasks: [
        { id: 'demo-task-11', name: 'Conferir materiais e liberar frente', weight: 30, start: '2026-12-01', end: '2026-12-02', status: 'Pendente', requiresValidation: false, validatedAt: '', executionDate: '', owners: ['Larissa Costa'], observation: '', evidence: [] },
        { id: 'demo-task-12', name: 'Executar acabamentos e registrar fotos', weight: 70, start: '2026-12-03', end: '2026-12-12', status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: ['Larissa Costa'], observation: '', evidence: [] },
      ] },
      { id: 'demo-act-7', name: 'Testes e liberação final', description: 'Comissionamento e entrega documentada.', weight: 35, start: '2026-12-13', end: '2026-12-18', owners: ['Ana Ribeiro', 'Larissa Costa'], tasks: [
        { id: 'demo-task-13', name: 'Executar testes funcionais', weight: 55, start: '2026-12-13', end: '2026-12-16', status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: ['Ana Ribeiro'], observation: '', evidence: [] },
        { id: 'demo-task-14', name: 'Registrar pendências e aceite da área', weight: 45, start: '2026-12-17', end: '2026-12-18', status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: ['Larissa Costa'], observation: '', evidence: [] },
      ] },
    ] },
  ],
  versions: [{ id: 'demo-version-1', at: '2026-11-01T12:00:00.000Z', actor: 'Gerência de Infraestrutura', summary: 'Cronograma original aprovado para demonstração.', rationale: 'Referência inicial demonstrativa.' }],
  events: [],
}

const templateDefinitions = [
  ['Reforma de centro cirúrgico', ['Planejamento e isolamento assistencial', 'Demolição e infraestrutura', 'Instalações críticas', 'Acabamentos e comissionamento']],
  ['Reforma de apartamento hospitalar', ['Planejamento e proteção da unidade', 'Demolições e instalações', 'Acabamentos e mobiliário', 'Limpeza e liberação assistencial']],
  ['Reforma de fachada', ['Acessos e proteção perimetral', 'Recuperação de superfície', 'Revestimento e vedação', 'Inspeção e retirada de proteção']],
  ['Adequação elétrica', ['Levantamento e desligamentos', 'Infraestrutura e cabeamento', 'Quadros e equipamentos', 'Testes e energização']],
  ['Adequação hidráulica', ['Levantamento e isolamento', 'Redes e pontos hidráulicos', 'Louças e acabamentos', 'Testes e liberação']],
  ['Climatização e HVAC', ['Levantamento e plano de intervenção', 'Dutos e infraestrutura', 'Equipamentos e controles', 'Balanceamento e comissionamento']],
  ['Instalações de gases medicinais', ['Levantamento e validações técnicas', 'Rede e suportação', 'Terminais e equipamentos', 'Testes e certificação']],
  ['Construção de área assistencial', ['Concepção e projetos', 'Estrutura e instalações', 'Acabamentos assistenciais', 'Comissionamento e entrega']],
  ['Reforma de consultórios', ['Planejamento e proteção', 'Adequações civis e instalações', 'Acabamentos e mobiliário', 'Limpeza e liberação']],
]

const templateWeights = [20, 25, 30, 25]
const templateDates = [['2026-11-16', '2026-11-20'], ['2026-11-21', '2026-11-30'], ['2026-12-01', '2026-12-11'], ['2026-12-12', '2026-12-18']]
export const planningTemplates = templateDefinitions.map(([name, phaseNames], templateIndex) => ({
  id: `modelo-${templateIndex + 1}`,
  name,
  phases: phaseNames.map((phaseName, phaseIndex) => ({
    id: `modelo-${templateIndex + 1}-fase-${phaseIndex + 1}`,
    name: phaseName,
    description: `Etapa demonstrativa de ${name.toLowerCase()}. Edite para refletir o escopo real.`,
    weight: templateWeights[phaseIndex],
    start: templateDates[phaseIndex][0],
    end: templateDates[phaseIndex][1],
    owners: [],
    archived: false,
    activities: [
      { id: `modelo-${templateIndex + 1}-atividade-${phaseIndex + 1}-a`, name: `Preparar e liberar: ${phaseName.toLowerCase()}`, description: 'Preparação, segurança e validação de pré-requisitos.', weight: 60, start: templateDates[phaseIndex][0], end: templateDates[phaseIndex][0], owners: [], tasks: [
        { id: `modelo-${templateIndex + 1}-tarefa-${phaseIndex + 1}-a1`, name: 'Conferir projeto, materiais e liberação da área', weight: 35, start: templateDates[phaseIndex][0], end: templateDates[phaseIndex][0], status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: [], observation: '', evidence: [] },
        { id: `modelo-${templateIndex + 1}-tarefa-${phaseIndex + 1}-a2`, name: 'Preparar equipe, proteção e sinalização', weight: 65, start: templateDates[phaseIndex][0], end: templateDates[phaseIndex][0], status: 'Pendente', requiresValidation: false, validatedAt: '', executionDate: '', owners: [], observation: '', evidence: [] },
      ] },
      { id: `modelo-${templateIndex + 1}-atividade-${phaseIndex + 1}-b`, name: `Executar e conferir: ${phaseName.toLowerCase()}`, description: 'Execução da etapa e registro de evidências.', weight: 40, start: templateDates[phaseIndex][0], end: templateDates[phaseIndex][1], owners: [], tasks: [
        { id: `modelo-${templateIndex + 1}-tarefa-${phaseIndex + 1}-b1`, name: 'Executar serviços previstos na etapa', weight: 70, start: templateDates[phaseIndex][0], end: templateDates[phaseIndex][1], status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: [], observation: '', evidence: [] },
        { id: `modelo-${templateIndex + 1}-tarefa-${phaseIndex + 1}-b2`, name: 'Conferir qualidade e anexar evidências', weight: 30, start: templateDates[phaseIndex][1], end: templateDates[phaseIndex][1], status: 'Pendente', requiresValidation: true, validatedAt: '', executionDate: '', owners: [], observation: '', evidence: [] },
      ] },
    ],
  })),
}))
