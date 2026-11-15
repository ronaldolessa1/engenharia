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

Build + lint + testes automáticos de cálculo. A interface ainda precisa ser conferida visualmente em computador e celular.

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

## Checklist de testes vivo

### Como trabalhamos

Ronaldo não programa: decide o produto e testa na tela. O assistente constrói o **CODEX – Gestão Integrada de Obras Hospitalares** e mantém uma página de testes viva para Ronaldo saber o que testar e relatar o que deu errado.

### 1. Página de testes

Na primeira melhoria que precisar de teste, criar uma página publicada chamada **Testes do CODEX – Gestão Integrada de Obras Hospitalares**, com banco de dados próprio para guardar as marcas no servidor. Se não houver ferramenta de página publicada disponível na conversa, criar `testes.html` na pasta do projeto, guardando as marcas no navegador, e avisar Ronaldo que ele precisará colar o resultado de volta.

A página deve ser simples, funcional no celular e mostrar somente o que falta testar. No topo, incluir a rodada (nome, nota curta sobre o que mudou e instrução para começar, como `aperte Ctrl+F5`). Criar um cartão por item, agrupado por módulo, com:

- título de um comportamento;
- passos numerados, uma ação por passo, com os nomes exatos dos controles da interface;
- resultado esperado, observável e respondível com sim ou não;
- botões `A testar`, `Funcionou` e `Problema`;
- campo de observação.

### 2. Ciclo de cada melhoria

1. Construir a melhoria.
2. Antes de entregar para Ronaldo, executar os testes pertinentes e o portão de qualidade definido pelo projeto (`npm run check` nesta base), abrir e conferir a tela no navegador. Se houver mudança no banco, também executar o teste de permissões. Entregar apenas o que passou e declarar o que não foi possível conferir e por quê (por exemplo, uma etapa que depende da senha de Ronaldo).
3. Escrever os itens a testar na página e enviar o link, com um resumo de uma linha por item.
4. Ronaldo testa e marca cada item; nos itens com problema, registra o que viu.
5. Quando Ronaldo avisar **“atualizei os testes”**, ler as marcas diretamente da página; não pedir que ele copie os resultados para o chat quando a página permitir leitura direta.
6. Para cada problema, investigar a causa antes de editar: ler o código, os registros do servidor e o banco conforme aplicável. Explicar em uma linha o que ocorria e o que mudou.
7. Atualizar a página: remover itens aprovados; devolver itens com problema como `A testar`, com passos corrigidos; incluir itens novos; atualizar a nota da rodada.
8. Repetir até não haver itens pendentes. Ao fechar a rodada, mostrar **“nada a testar agora”**.

Itens aprovados saem da página. Se for útil manter histórico, registrar uma linha por item aprovado em `docs/DIARIO.md`, com data, mudança e o que passou. Não manter histórico morto na página.

### 3. Escrever itens reproduzíveis

- Um comportamento por item; separar ações que podem falhar de forma independente.
- Escrever passos repetíveis por uma pessoa que não programa, na ordem da tela e com os rótulos exatos.
- Descrever um resultado visível, não uma conclusão técnica (por exemplo, “a empresa aparece na lista com o telefone novo”).
- Cobrir entradas inválidas e ações indevidas: campo obrigatório vazio, e-mail inválido, clique duplo ou operação não permitida, quando aplicável.
- Informar a conta/perfil a usar e se o teste grava dado. Se gravar, explicar como desfazer sem apagar dados reais; preferir dados fictícios e desativação.

### 4. Provas obrigatórias ao conectar telas ao banco

Para cada tela que passar a gravar dados, incluir testes que comprovem:

| Prova | O item deve verificar |
|---|---|
| Persistência | Depois de salvar e apertar F5, o registro continua lá? |
| Fidelidade | Após F5, acentos, datas, números, ordem e demais campos correspondem ao que foi digitado? |
| Isolamento | Uma conta de outro perfil e, quando houver, de outra obra/cliente, vê somente os registros permitidos? |
| Recusa explicada | Um perfil sem permissão tem a gravação recusada pelo banco e recebe explicação visível na tela? |
| Sem duplicidade | Salvar duas vezes ou repetir uma importação cria duplicatas? |
| Histórico preservado | Desativar um registro usado em outra tela mantém essa tela funcionando? |
| Lista pequena e grande | A lista vazia orienta o próximo passo e listas grandes exibem todos os registros? Considerar o limite padrão de 1.000 linhas do Supabase. |
| Falha de rede | Se a conexão cair durante a gravação, a tela informa claramente que não salvou? |

Antes de entregar mudanças que toquem o banco:

- Toda mudança de banco deve ser registrada em arquivo versionado no projeto, nunca feita apenas por clique no painel.
- Manter teste automático de permissões para cada perfil, incluindo leitura e gravação em dados próprios e alheios; usar transação revertida para não deixar dados no banco. Executá-lo após qualquer alteração de permissão.
- Fazer revisão de código antes do push em toda mudança na camada de dados, nas permissões ou no login.
- Conferir os avisos de segurança do painel do banco após cada mudança e explicar quais são intencionais e quais precisam ser corrigidos.

### 5. Limites e segurança

- Nunca digitar senha, chave ou token, nem criar conta em nome de Ronaldo. Se uma etapa exigir credenciais, escrever o passo para ele entrar com a própria conta.
- Nunca colocar segredos (chaves, senhas ou conteúdo de `.env`) no código, no Git ou na página de testes.
- Usar somente dados fictícios em exemplos; não usar dados reais de clientes.
- Não declarar algo pronto sem executar o portão de qualidade e conferir a tela. Se não for possível conferir, explicar isso.
- Nunca apagar dados reais para limpar um teste. Desativar é permitido; apagar exige autorização explícita de Ronaldo.

### 6. Resumo após cada rodada

Responder em português simples e de forma curta, informando:

- o que passou e saiu da página;
- uma tabela para cada problema, com **o que estava acontecendo** e **o que mudou**;
- o que voltou para teste e o que é novo;
- o que não foi possível conferir e por quê;
- qual decisão de Ronaldo está pendente, se houver.

Se for necessária uma decisão, fazer uma pergunta por vez e incluir uma recomendação.
