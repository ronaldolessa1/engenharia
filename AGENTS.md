# CODEX – Gestão Integrada de Obras Hospitalares

Interface React + Vite para gestão de obras hospitalares; detalhes de tela em `PRD-FRONTEND.md`. Nesta Fundação, todos os dados são locais e fictícios, sem conexão com banco.

## Onde o código novo vai

- Interface e estado de tela: `src/App.jsx`.
- Dados demonstrativos compartilhados: `src/lib/mockData.js`.
- Não inventar valores reais do CTCH; marcar exemplos como demonstração.
- Enquanto `PRD-BACKEND.md` não existir, não conectar Supabase nem implementar autorização real.

## Régua de verificação

```bash
npm run check
```

Build + lint. A interface ainda precisa ser conferida visualmente em computador e celular.

## Antes de subir para o GitHub

Mudanças futuras em dados, Supabase, políticas RLS, migrations ou fluxo financeiro devem passar por revisão de código antes do push.

## Deploy

Vite gera a versão em `dist/`; `vercel.json` define o build e a pasta de saída.

## Armadilhas desta base

- CTCH é apenas exemplo; valores e datas demonstrativos não descrevem a obra real.
- O indicador de custo percentual ainda depende de definição (medido, aprovado ou pago).
- Sem PRD-BACKEND, permissões, persistência e aprovação segregada não são aplicadas pelo app.

## Higiene de código

- Ao remover recurso, procure a cadeia de chamadores e dados no projeto inteiro.
- Zero avisos novos de lint.
- Código comentado não é backup; o Git é.
- Antes de apagar, prove que o símbolo está morto; limpeza nunca toca em banco ou arquivo de dados.
- Estado sem leitura ou atualização é código morto.
