// Dados fictícios de demonstração; não representam valores reais do CTCH.
export const works = [
  { id: 'DEMO-01', name: 'CTCH · Centro de Tratamento Cirúrgico', location: 'Bloco cirúrgico', phase: 'Execução', status: 'Atenção', progress: 62, planned: 68, cost: 48, next: 'Compatibilizar gases medicinais', owner: 'Ana Ribeiro', delay: 6 },
  { id: 'DEMO-02', name: 'Central de Material Esterilizado', location: 'CME', phase: 'Projetos', status: 'Em análise', progress: 18, planned: 20, cost: 12, next: 'Revisão elétrica', owner: 'Paulo Lima', delay: 0 },
  { id: 'DEMO-03', name: 'Posto assistencial · Ala Norte', location: 'Internação', phase: 'Execução', status: 'Atrasada', progress: 41, planned: 55, cost: 39, next: 'Receber material elétrico', owner: 'Marcos Dias', delay: 4 },
  { id: 'DEMO-04', name: 'Quadros elétricos · Bloco C', location: 'Infraestrutura', phase: 'Execução', status: 'Paralisada', progress: 54, planned: 60, cost: 46, next: 'Aguardar componente', owner: 'Ana Ribeiro', delay: 0 },
  { id: 'DEMO-05', name: 'Sanitários acessíveis · Bloco B', location: 'Bloco B', phase: 'Entrega', status: 'Dentro do prazo', progress: 96, planned: 92, cost: 91, next: 'Inspeção final', owner: 'Larissa Costa', delay: 0 },
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
export const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
