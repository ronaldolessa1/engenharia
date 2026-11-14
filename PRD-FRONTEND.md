# PRD Frontend — CODEX – Gestão Integrada de Obras Hospitalares

> Especificação da interface. Fonte das decisões: `PLANO-DO-PROJETO.md` e requisitos enviados pelo responsável.
> Dados do CTCH e demais exemplos deste documento são fictícios e servem apenas para demonstração; não representam a obra real.

## O que o sistema é

Sistema web responsivo para acompanhar obras hospitalares do pedido inicial à entrega, centralizando execução, aprovações, cronograma e controle físico-financeiro. O uso principal é do Gerente de Infraestrutura no computador e de engenheiros/fiscais e mestres/empreiteiros no canteiro pelo celular.

## Padrão técnico

- React + Vite (versões atuais), sem biblioteca de componente pronta.
- Visual a partir de um `index.css` próprio.
- Navegação por estado, sem endereço no navegador.
- Referência visual escolhida: opção 3, **Painel** — cabeçalho escuro, cartões compactos, listas densas e etiquetas de status.
- Paleta provisória derivada visualmente da referência anexada: principal teal `#00A8B5`, escura `#263238`, fundo `#E9EEF0`, alerta/atenção âmbar `#E7A72E`, crítico vermelho `#E65B50`; verde semântico `#18856B`. A paleta enviada continha apenas a palavra “principal”, sem código hexadecimal; estes valores são aproximações para a prévia e devem ser confirmados.
- Tema claro, alto contraste, números e status com destaque visual.
- Celular: barra inferior fixa com 5 itens. Computador: menu lateral fixo à esquerda.
- Alvos de toque com no mínimo 44 px, rótulos sempre visíveis e textos legíveis em tela externa/canteiro.
- Em larguras pequenas, cartões empilham; tabelas viram listas; nenhuma tela exige rolagem horizontal.
- Imagens e documentos são apresentados como miniaturas/links; a interface não presume que os dados reais do CTCH já estejam cadastrados.

## Perfis

- **Administrador / Gerente de Infraestrutura:** entra no Painel. Vê e administra toda a carteira, documentos, cronogramas, contratos, custos e aprovações; distribui acesso por obra.
- **Engenheiro / Fiscal:** entra em Execução. Vê as obras alocadas; registra diário, avanço, fotos, ocorrências, materiais e não conformidades; pode revisar medições, sem aprovar a própria solicitação.
- **Mestre de Obras / Empreiteiro:** entra em Execução. Vê apenas as obras/contratos atribuídos; informa equipe, serviços, materiais, dificuldades, paralisações e próximas atividades; não aprova o próprio serviço ou medição. Exibição de valores do próprio contrato está pendente de confirmação.
- **Área solicitante:** entra em Obras/Visão da obra. Vê evolução e informações da obra alocada; valida entregas ligadas à própria área e registra pendências. Sem acesso a valores por padrão.
- **Diretoria:** entra no Painel executivo. Vê indicadores, avanço físico/financeiro, orçamento, riscos e previsão das obras permitidas; sem editar registros operacionais por padrão.
- **Financeiro:** entra em Financeiro. Vê contratos, medições aprovadas, notas fiscais, pagamentos, compromissos e saldo das obras permitidas; não altera registros técnicos de execução.
- **Conta sem liberação:** não vê dados; recebe o aviso “Conta aguardando liberação do administrador”.
- A alocação por obra limita a carteira exibida. Permissões específicas para valores e documentos ainda precisam ser confirmadas antes da implementação do banco.

## Mapa de navegação

```text
Login / Cadastro
├── Administrador / Gerente: Painel · Obras · Execução · Aprovações · Financeiro · Meu perfil
├── Engenheiro / Fiscal: Execução · Obras alocadas · Aprovações atribuídas · Meu perfil
├── Mestre / Empreiteiro: Execução · Obras atribuídas · Meu perfil
├── Área solicitante: Obras alocadas · Aprovações atribuídas · Meu perfil
├── Diretoria: Painel executivo · Obras permitidas · Meu perfil
└── Financeiro: Financeiro · Obras permitidas · Meu perfil

Menu lateral no computador e barra inferior no celular: Painel · Obras · Execução · Aprovações · Financeiro.
Entrega e Qualidade ficam acessíveis no detalhe da obra; Compras e Materiais ficam nas abas da obra e de Execução.
```

---

## Tela: Login e cadastro

**Quem acessa:** todos, antes de entrar.
**Chega aqui por:** abertura do sistema.

**O que aparece**
Marca textual CODEX, campos de e-mail e senha, botão Entrar e ação Criar conta. Após cadastro, aparece aviso de conta pendente de liberação. A tela nunca apresenta dados de obras antes da autenticação e liberação.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| E-mail | e-mail | Sim | Identificador da conta |
| Senha | senha | Sim | Oculta por padrão; botão para revelar |
| Confirmar senha | senha | No cadastro | Só aparece em Criar conta |

**Ações**
- **Entrar:** abre a tela inicial correspondente ao perfil.
- **Criar conta:** registra solicitação e mostra “Conta aguardando liberação do administrador”.
- **Esqueci a senha:** inicia recuperação por e-mail.

**Regras por perfil**
- Todas as pessoas usam a mesma tela; perfis são atribuídos pelo administrador depois do cadastro.
- Conta pendente ou sem perfil não acessa nenhuma tela de dados.

**Estado vazio**
Não se aplica.

---

## Tela: Painel gerencial

**Quem acessa:** Administrador/Gerente e Diretoria; a visão da Diretoria respeita as obras alocadas.
**Chega aqui por:** após login dos perfis autorizados; item Painel no menu.

**O que aparece**
1. Cabeçalho com período, seletor de obra (todas ou uma obra), botão “Atualizar dados” e indicação “Dados de demonstração” quando aplicável.
2. Foco principal por obra selecionada: avanço físico, custo acumulado como percentual do valor total e diferença entre eles. O numerador do custo percentual ainda será definido; enquanto isso, cada cartão identifica a base usada.
3. Cartões de carteira: obras em andamento, atrasadas, aguardando aprovação e dentro do prazo.
4. Lista “Precisa da sua atenção” com atrasos e dias, paralisações e motivo, aprovações, compras/materiais e medições pendentes.
5. Tabela/lista compacta de obras com etapa, status, avanço físico previsto/realizado, cronograma, custo percentual e próxima atividade/responsável.
6. Resumo de CAPEX aprovado, contratado, medido e pago, sem misturar as bases de cálculo.
7. Ao clicar numa obra, abre seu detalhe; ao clicar num alerta, abre o item correspondente.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Obra | filtro | Não | “Todas” ou obra permitida ao usuário |
| Período | filtro | Não | Semana, mês ou intervalo |
| Avanço físico | indicador percentual | — | Calculado pelos pesos da EAP; mostra previsto e realizado |
| Custo da obra | indicador percentual e moeda | — | Base (medido/aprovado/pago) visível no rótulo; definição pendente |
| Situação e etapa | etiqueta | — | Status semântico e fase do ciclo |
| Desvio de prazo | número e texto | — | Dias adiantados/atrasados; sem sinal quando não há datas válidas |
| Pendência | linha compacta | — | Tipo, obra, responsável e prazo |
| Próxima atividade | linha | — | Atividade, responsável e previsão |

**Ações**
- **Selecionar obra/período:** atualiza indicadores e listas em contexto.
- **Abrir obra:** abre o detalhe da obra selecionada.
- **Abrir pendência:** abre a validação, compra, medição ou atividade relacionada.
- **Ver todas as obras:** abre Obras com filtros atuais preservados.

**Regras por perfil**
- **Diretoria:** leitura dos indicadores e riscos autorizados; sem botões de edição operacional.
- **Administrador/Gerente:** vê carteira completa e pode abrir qualquer registro.
- Perfis de campo não recebem painel financeiro consolidado; sua tela inicial é Execução.

**Estado vazio**
“Não há obras nesta carteira ainda.” Ação “Cadastrar primeira obra”, apenas para administrador.

---

## Tela: Obras e detalhe da obra

**Quem acessa:** Administrador/Gerente; Engenheiro/Fiscal, Área solicitante e Diretoria nas obras alocadas; Mestre/Empreiteiro apenas nas obras atribuídas.
**Chega aqui por:** item Obras; clique em uma linha do Painel.

**O que aparece**
- Lista com busca, filtros por fase, status, responsável e prazo; cartões em celular.
- Cada item mostra nome/código, unidade, etapa, status, avanço físico, custo percentual se permitido, previsão e responsável principal.
- No detalhe: resumo; escopo e autorização; etapas do ciclo; abas Visão geral, Projetos e documentos, Aprovações, Contratos, Compras, Qualidade e Entrega; histórico em ordem cronológica.
- Criação de obra abre formulário dividido em identificação, necessidade/escopo, equipe e autorização.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Nome da obra | texto | Sim | Ex.: CTCH – Centro de Tratamento Cirúrgico Hospitalar |
| Código | texto | Não | Código interno, se houver |
| Unidade/local | texto | Sim | Hospital, bloco, andar ou área |
| Justificativa e necessidade assistencial | texto longo | Sim | Descreve solicitação e motivo |
| Diagnóstico técnico | texto longo | Não | Registro técnico inicial |
| Escopo preliminar | texto longo | Sim | Obra não avança à execução sem escopo formal |
| Fase e status | seleção | Sim | Lista definida pelo ciclo do projeto |
| Responsáveis | seleção múltipla | Não | Opções vêm dos cadastros; novas pessoas podem ser incluídas conforme a obra avança |
| Datas previstas | data | Não | Não preencher com datas inventadas |
| Autorização de início | arquivo/referência e data | Obrigatório antes da execução | Evidência formal |

**Ações**
- **Nova obra:** abre formulário; salvar cria a obra em Concepção.
- **Abrir obra:** exibe detalhe sem perder os filtros da lista.
- **Adicionar responsável:** oferece pessoas cadastradas, permite associar vários e indicar função na obra.
- **Anexar documento/revisão:** adiciona arquivo com tipo, revisão, responsável e data.
- **Avançar fase:** só permite seguir se os requisitos formais da fase estiverem completos.
- **Ver histórico:** abre sequência de alterações, aprovações e anexos.

**Regras por perfil**
- **Administrador/Gerente:** cria, edita e aloca perfis nas obras.
- **Engenheiro/Fiscal:** edita registros técnicos nas obras alocadas.
- **Mestre/Empreiteiro:** atualiza suas informações de execução; não altera orçamento ou aprovações.
- **Área solicitante:** consulta e registra validações/pendências da própria área.
- **Diretoria e Financeiro:** leitura de campos conforme perfil; valores ocultos da Área solicitante por padrão.

**Estado vazio**
“Quando uma obra for cadastrada, ela aparecerá aqui com sua etapa, responsáveis e evolução.” Botão “Cadastrar primeira obra” para quem tiver permissão.

---

## Tela: Execução, EAP e diário de obra

**Quem acessa:** Administrador/Gerente, Engenheiro/Fiscal e Mestre/Empreiteiro nas obras alocadas.
**Chega aqui por:** item Execução ou aba Execução no detalhe da obra.

**O que aparece**
- Seletor de obra e data; destaque de atividades de hoje, atrasadas e paralisadas.
- EAP em lista hierárquica com peso, previsto x realizado, prazo, responsáveis e situação.
- Cartão de avanço físico agregado. Uma atividade só contribui conforme seus pesos aprovados; não há edição manual do total consolidado.
- Diário de obra em sequência por data, com equipe presente, serviços realizados, materiais, ocorrências, paralisação e próximas atividades.
- Registro fotográfico com miniaturas e vínculo à atividade/data.
- Botão de ação grande “Registrar diário de hoje”.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Obra | seleção | Sim | Apenas obras atribuídas ao perfil |
| Data do diário | data | Sim | Padrão hoje; edição conforme permissão |
| Atividades realizadas | seleção múltipla | Sim | Atividades da EAP da obra |
| Percentual da atividade | percentual | Conforme atividade | Evidência requerida; avanço físico total é calculado pelo peso da EAP |
| Equipe presente | pessoas/quantidade | Não | Pessoas cadastradas ou quantidade de demonstração explicitamente marcada |
| Materiais utilizados | lista | Não | Nome, quantidade e unidade quando informados |
| Ocorrência/paralisação | categoria e texto | Se houver ocorrência | Motivo e impacto; sem ocorrência, não exigir preenchimento |
| Próxima atividade e responsáveis | seleção e data | Não | Pessoas selecionadas dos cadastros; múltiplos responsáveis permitidos |
| Fotografias | arquivos de imagem | Sim para comprovar execução/medição | Data, obra e atividade associadas |

**Ações**
- **Registrar diário:** abre formulário de campo em etapas curtas; salvar mostra confirmação e o diário no topo da lista.
- **Adicionar atividade/responsável:** associa elemento existente da EAP ou pessoa cadastrada.
- **Anexar foto:** abre câmera/galeria do aparelho, exibe miniatura e permite legenda.
- **Marcar paralisação:** exige motivo; a atividade aparece com status de atenção.
- **Ver atividade:** abre histórico, prazo, responsável e evidências.

**Regras por perfil**
- **Mestre/Empreiteiro:** informa execução e evidências; não aprova o próprio serviço ou medição.
- **Engenheiro/Fiscal:** revisa e corrige registros de campo; confirma avanço físico com evidência.
- **Administrador/Gerente:** consulta e supervisiona todos os registros permitidos.

**Estado vazio**
“Esta obra ainda não tem atividades na EAP.” Botão “Adicionar primeira atividade” para administrador/gerente; demais perfis veem orientação para solicitar a alocação.

---

## Tela: Aprovações e pendências

**Quem acessa:** Administrador/Gerente, aprovadores de cada área e solicitantes alocados.
**Chega aqui por:** item Aprovações, cartão de pendências ou aba da obra.

**O que aparece**
- Filas “Aguardando minha ação”, “Em análise”, “Devolvidas” e “Concluídas”.
- Cada item mostra obra, tipo, etapa, solicitante, prazo, responsável atual e evidência anexada.
- Detalhe apresenta trilha de aprovação multidisciplinar: Engenharia/Infraestrutura, Área assistencial, SCIH, Engenharia Clínica, SESMT, TI, Facilities, Diretoria e outras áreas configuradas.
- Comentários e documentos ficam vinculados à decisão e à revisão.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Obra | referência | Sim | Obra da aprovação |
| Tipo de aprovação | seleção | Sim | Projeto, CAPEX, mudança, medição, entrega ou outro |
| Área aprovadora | seleção | Sim | Lista configurável pelo administrador |
| Responsável | pessoa | Sim | Selecionado dos cadastros |
| Situação | seleção | Sim | Pendente, em análise, aprovado, devolvido ou rejeitado |
| Data e observação | data/texto | Na decisão | Registro permanente de autoria e decisão |
| Evidência documental | arquivo/referência | Conforme tipo | Obrigatória para aprovação de medição e entregas aplicáveis |

**Ações**
- **Aprovar:** salva autor, data e observação; envia item à próxima área ou fase.
- **Devolver para ajuste:** exige motivo e devolve ao responsável.
- **Rejeitar:** exige justificativa e mantém trilha de auditoria.
- **Abrir evidência:** apresenta foto/documento associado.

**Regras por perfil**
- **Aprovador:** decide apenas itens atribuídos a ele ou à sua área.
- **Mestre/Empreiteiro:** não pode aprovar serviço ou medição que registrou.
- **Administrador/Gerente:** acompanha a fila e designa responsável; não apaga histórico de decisões.

**Estado vazio**
“Tudo em dia: não há aprovações aguardando sua ação.”

---

## Tela: Financeiro, contratos e medições

**Quem acessa:** Financeiro e Administrador/Gerente; Diretoria em leitura executiva; demais perfis somente campos autorizados.
**Chega aqui por:** item Financeiro; cartões de valores ou medições no detalhe da obra.

**O que aparece**
- Seletor de obra e período.
- Resumo separado: CAPEX aprovado, contratado, medido, aprovado para pagamento, pago e saldo contratual.
- Medições agrupadas por status, período e fornecedor; cada item liga itens medidos às atividades/EAP e suas evidências.
- Contratos, aditivos, notas e compromissos aparecem em abas internas.
- Diferença entre avanço físico e financeiro com explicação de qual base de cálculo foi usada.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Obra/contrato | referência | Sim | Isolamento por obra e contrato |
| Fornecedor | cadastro | Sim | Selecionado dos cadastros |
| Valor contratado | moeda | Conforme contrato | BRL; fonte é contrato aprovado |
| Item/atividade medida | referência | Sim | Vincula medição à EAP/escopo contratado |
| Quantidade e valor medidos | número/moeda | Sim | Não pode exceder saldo contratual sem aditivo aprovado |
| Evidências | fotos/documentos | Sim para solicitar aprovação | Sem evidência, ação Aprovar fica indisponível |
| Status da medição | seleção | Sim | Rascunho, enviada, em análise, devolvida, aprovada ou paga |
| Nota fiscal/pagamento | arquivo, valor e data | Conforme etapa | Visibilidade limitada ao Financeiro e Gerência |

**Ações**
- **Nova medição:** seleciona itens/atividades, quantidades e evidências; envia para revisão técnica.
- **Revisar medição:** registra ajuste ou devolução com motivo.
- **Aprovar medição:** disponível apenas para papel autorizado distinto do solicitante; exige evidência de execução.
- **Registrar nota/pagamento:** atualiza os totais pagos sem reescrever valores aprovados.
- **Abrir contrato/aditivo:** apresenta documentos e histórico.

**Regras por perfil**
- **Financeiro:** vê valores, notas, pagamentos e saldos; registra pagamentos conforme competência.
- **Administrador/Gerente:** acompanha contratos, CAPEX, medições e aprovações.
- **Diretoria:** visualiza indicadores financeiros executivos.
- **Engenheiro/Fiscal:** informa/revisa quantidades e evidências; não registra pagamento.
- **Mestre/Empreiteiro:** envia a medição e evidências do próprio escopo; não aprova. Visibilidade dos valores do próprio contrato aguarda confirmação.
- **Área solicitante:** sem valores financeiros por padrão.

**Estado vazio**
“Esta obra ainda não tem contratos ou medições cadastrados.” Botão “Cadastrar contrato” para Gerência/Financeiro.

---

## Tela: Compras, qualidade e entrega (acessada dentro da obra)

**Quem acessa:** Administrador/Gerente, Engenheiro/Fiscal, Financeiro e Área solicitante conforme item; fornecedores/empreiteiros apenas registros atribuídos.
**Chega aqui por:** abas internas do detalhe da obra.

**O que aparece**
- Aba Compras e Materiais: solicitações, cotações, aprovação, pedido, previsão e recebimento, sempre ligados à obra e opcionalmente a uma atividade.
- Aba Qualidade: inspeções, não conformidades, responsável, prazo, evidência e correção.
- Aba Entrega: testes e comissionamento, lista de pendências, as built, manuais, garantias e recebimentos provisório/definitivo.
- Botões e campos de escrita só aparecem para perfis com permissão.

**Campos e informações**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Tipo de registro | seleção | Sim | Compra, material, não conformidade, teste ou pendência de entrega |
| Descrição | texto | Sim | Linguagem objetiva e vinculada à obra |
| Responsável | cadastro de pessoa/fornecedor | Sim | Pode ser incluído conforme avanço da obra |
| Prazo/status | data e seleção | Conforme etapa | Status visível com cor semântica e texto |
| Evidência | foto/documento | Quando aplicável | Anexada ao registro, nunca solta da obra |
| Valor e fornecedor | moeda/cadastro | Em compras, conforme permissão | Valores restritos por perfil |

**Ações**
- **Criar solicitação de compra:** inicia registro com item, quantidade, justificativa e responsável.
- **Registrar recebimento:** vincula entrega e evidência à solicitação.
- **Abrir não conformidade:** exige descrição, responsável e prazo.
- **Concluir correção/teste:** grava evidência, data e responsável.
- **Registrar recebimento provisório/definitivo:** exige lista de pendências correspondente e documentos aplicáveis.

**Regras por perfil**
- **Engenheiro/Fiscal:** registra qualidade, inspeção e recebimento técnico.
- **Área solicitante:** registra pendências da sua área e valida entregas vinculadas.
- **Financeiro:** acompanha pedidos/compromissos e valores permitidos.
- **Mestre/Empreiteiro:** informa material, recebimento e correção atribuídos; sem aprovação final.
- **Administrador/Gerente:** acompanha e administra o fluxo inteiro.

**Estado vazio**
“Sem solicitações de compra por aqui. Quando uma necessidade aparecer, registre-a para acompanhar aprovação e entrega.” Botão “Criar primeira solicitação”.

---

## Textos do sistema

- Botões: “Salvar”, “Cancelar”, “Nova obra”, “Registrar diário”, “Adicionar responsável”, “Enviar para aprovação”, “Aprovar”, “Devolver para ajuste”, “Anexar evidência”, “Criar primeira solicitação”.
- Confirmação de exclusão: “Excluir este registro? O histórico relacionado será preservado quando houver impacto em obra, aprovação ou medição.” Exclusão física só fica disponível para registros rascunho e perfis autorizados.
- Aviso de conta pendente: “Conta aguardando liberação do administrador”.
- Erro genérico: “Não foi possível salvar agora. Seus dados continuam nesta tela; tente novamente.”
- Aviso de demonstração: “Dados fictícios para demonstração — substitua pelos dados da obra antes de usar decisões reais.”
- Campos sem informação real: “Não informado”. Não exibir zero quando o valor é desconhecido.

## Dados de exemplo

Todos os registros abaixo são **fictícios para demonstração**, inclusive os que usam o nome CTCH. Valores, percentuais e datas não descrevem a obra real.

| Código | Obra | Fase | Status | Avanço físico | Custo demonstrativo / valor total demonstrativo | Pendência/atividade |
|---|---|---|---|---:|---:|---|
| DEMO-01 | CTCH – Centro de Tratamento Cirúrgico Hospitalar | Execução | Atenção | 62% | 48% | Aprovação de revisão de projeto |
| DEMO-02 | Reforma da Central de Material Esterilizado | Projetos | Em análise | 18% | 12% | Compatibilização elétrica |
| DEMO-03 | Adequação do posto assistencial – Ala Norte | Execução | Atrasada | 41% | 39% | Material elétrico pendente |
| DEMO-04 | Adequação da sala técnica de climatização | Contratação | Aguardando aprovação | 0% | 0% | Análise comercial |
| DEMO-05 | Reforma de sanitários acessíveis – Bloco B | Entrega | Dentro do prazo | 96% | 91% | Inspeção final |
| DEMO-06 | Modernização de quadros elétricos – Bloco C | Execução | Paralisada | 54% | 46% | Aguardando componente; motivo demonstrativo |
| DEMO-07 | Recuperação de cobertura técnica – Bloco A | Concepção | Rascunho | 0% | 0% | Escopo preliminar |
| DEMO-08 | Adequação de gases medicinais – Unidade de Internação | Validações | Em análise | 8% | 5% | Validação da Engenharia Clínica |

Usuários de exemplo: Gerente, Engenheira Fiscal, Mestre de Obras, Solicitante Assistencial, Diretora e Analista Financeiro. Todos os nomes, vínculos e permissões de demonstração são fictícios.

## Critérios de aceite

- [ ] O sistema abre no Painel para Gerente/Diretoria e em Execução para perfis de campo.
- [ ] Painel destaca avanço físico e custo percentual e identifica explicitamente a base do custo.
- [ ] Selecionar uma obra atualiza seus indicadores e alertas sem recarregar a página.
- [ ] Cada perfil vê apenas as obras e campos autorizados; valores não aparecem para quem não tem permissão.
- [ ] Responsáveis podem ser adicionados dos cadastros conforme a obra avança; uma atividade aceita mais de um responsável.
- [ ] Mestre/Empreiteiro consegue registrar diário, fotos e medição, mas não aprova a própria medição.
- [ ] Aprovar medição sem evidência não é possível; a tela informa o que está faltando.
- [ ] Avanço físico mostrado no painel corresponde aos pesos e percentuais da EAP.
- [ ] Pendências, compras, medições, aprovações e prazos abrem o registro correspondente ao clicar.
- [ ] Estado vazio de Compras apresenta ícone, frase acolhedora e botão para criar a primeira solicitação.
- [ ] Status usa texto além de cor: verde para concluído/ok, âmbar para atenção e vermelho para atrasado/crítico.
- [ ] Em celular, barra inferior tem até 5 itens; botões de ação têm área de toque mínima de 44 px.
- [ ] Todas as telas cabem em celular sem rolagem horizontal.
- [ ] Exemplos fictícios estão identificados e não são confundidos com dados reais da obra CTCH.

## A conta que vai chegar depois

- Confirmar quais valores o Mestre/Empreiteiro pode ver no próprio contrato e nas próprias medições.
- Definir a base do indicador de custo percentual: medido, aprovado, pago ou outra.
- Definir regras finais de visibilidade para contratos e documentos por perfil/obra.
- Confirmar a paleta principal com código hexadecimal; o documento usa aproximação da opção 3 anexada.

## Decidir depois de usar

- Padrão provisório para menus de Compras, Qualidade e Entrega: abas dentro do detalhe da obra, para manter no máximo cinco itens na navegação principal.
- Padrão provisório para telas de campo: formulário curto em etapas, com salvar e anexar evidência sem sair da obra.
