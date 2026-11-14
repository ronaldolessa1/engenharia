# CODEX – Gestão Integrada de Obras Hospitalares

> Rascunho vivo. Planejamento em andamento; nenhuma programação iniciada.

## 1. Visão estratégica — rascunho

### Contexto
Sistema para gestão de obras e infraestrutura hospitalar do Hospital São Vicente, em Curitiba/PR. O responsável é Gerente de Infraestrutura, engenheiro civil especialista em infraestrutura hospitalar. A carteira atual é de aproximadamente 15 obras e demandas, em estágios diferentes. Não usar esse número como limite de cadastro.

### Problema principal
- **O que trava:** acompanhar simultaneamente obras, execução, fornecedores, aprovações, compras, prazos, medições e pagamentos com informações fragmentadas em WhatsApp, planilhas, e-mails, documentos e conversas.
- **Quando aparece:** acompanhamento semanal das obras e fechamento das medições.
- **Impacto em horas ou reais:** aproximadamente 2 horas por semana.

### Solução proposta
Um sistema web responsivo de gestão de obras hospitalares que centraliza o ciclo da obra, comprova a execução com diário e evidências, organiza aprovações e compras e compara avanço físico, financeiro e cronograma para indicar onde o gestor precisa atuar.

### Unidade principal
A entidade principal é a **obra**. O sistema terá várias obras independentes, cada uma com histórico, documentos, contratos, cronograma, responsáveis, orçamento e indicadores próprios, alimentando o painel consolidado.
- Primeira ação diária do gestor: verificar o avanço da obra e o custo em percentual do valor total da obra. A base financeira exata desse percentual (medido, aprovado, pago ou outra) será definida na etapa de fórmulas. O exemplo de modelagem é CTCH – Centro de Tratamento Cirúrgico Hospitalar. Dados reais ainda não fornecidos devem ficar vazios; dados fictícios precisam ser marcados como demonstração.

### Perfis informados
- **Administrador / Gerente de Infraestrutura:** visão e gestão global de obras, projetos, documentos, orçamento, contratos, cronograma, medições, pagamentos, indicadores, aprovações e usuários.
- **Engenheiro / Fiscal:** diário, atividades realizadas, evolução, fotos, ocorrências, materiais e não conformidades.
- **Mestre / Empreiteiro:** equipe, serviços e materiais executados, dificuldades, paralisações e previsão. Não aprova os próprios serviços nem medições.
- **Área solicitante:** acompanha obra, valida entregas ligadas à sua área e registra pendências.
- **Diretoria:** indicadores executivos, custos, riscos, progresso e previsão de conclusão.
- **Financeiro:** contratos, medições aprovadas, notas fiscais, pagamentos, compromissos e saldo.
- Permissões configuráveis por perfil e obra. Regras detalhadas de visibilidade de valores e documentos por perfil: [AINDA NÃO RESPONDIDO].
- Responsáveis pela execução são flexíveis: podem ser incluídos conforme a obra avança, inclusive vários por atividade/etapa; os valores são escolhidos a partir dos cadastros do sistema.

### Fluxo obrigatório
1. Concepção e solicitação.
2. Projetos e revisões.
3. Validações multidisciplinares.
4. Memorial, quantitativos, orçamento e aprovação CAPEX.
5. Cotação, contratação, documentação e mobilização.
6. Execução, EAP, diário, fotos, mão de obra, materiais, fiscalização e ocorrências.
7. Controle físico-financeiro, medições, pagamentos, desvios e previsões.
8. Inspeção, comissionamento, pendências, as built, garantias e encerramento.

### Regras de negócio já informadas
- Obra não inicia sem escopo e autorização formal.
- Medição exige evidência da execução e não pode ser aprovada pelo empreiteiro que a registrou.
- Avanço físico calculado pelos pesos das atividades da EAP.
- Avanço financeiro baseado em orçamento e medições aprovadas; comparar com avanço físico e sinalizar desvios.
- Alteração de escopo deve ter histórico e aprovação.
- Atividade requer responsável, prazo e situação.
- Obra guarda documentos e histórico; alertas para atraso, pendência e vencimento.

### Módulos propostos
1. **Painel gerencial:** destacar primeiro o avanço da obra e o custo acumulado como % do valor total; depois carteira, status e fase; avanço físico/financeiro; previsto x realizado; atrasos e dias; paralisações e motivos; aprovações, compras e medições pendentes; contratado, medido e pago; fotos recentes; próximas atividades e responsáveis. Filtros por obra, fase, responsável, status e período.
2. **Cadastro e concepção da obra:** solicitação, justificativa, necessidade assistencial, diagnóstico, escopo preliminar, unidade, responsáveis e autorização de início.
3. **Projetos e documentos:** disciplinas, entregáveis, revisões, versões, responsáveis, datas, evidências e histórico.
4. **Validações:** filas de aprovação por área (Engenharia, Assistencial, SCIH, Engenharia Clínica, SESMT, TI, Facilities, Diretoria e outras), com responsável, situação, data, observação e anexo; responsáveis escolhidos dos cadastros.
5. **Memorial, quantitativos e CAPEX:** serviços, materiais/insumos, mão de obra, composições, orçamento por etapa/global e CAPEX aprovado.
6. **Contratações e contratos:** cotações, análises técnica/comercial, fornecedor, escopo, valores, prazos, ART/RRT, aditivos, documentos e mobilização.
7. **EAP e cronograma:** atividades hierárquicas, pesos, predecessoras, datas planejadas/reais, um ou mais responsáveis selecionados dos cadastros, situação, paralisações e previsão.
8. **Diário e fiscalização:** apontamento diário, equipes, serviços, materiais, ocorrências, clima/condições (se necessário), fotos e não conformidades.
9. **Medições e pagamentos:** itens medidos, evidências, revisão técnica, aprovação segregada, notas fiscais, compromissos e pagamentos.
10. **Compras e materiais:** solicitações, aprovações, cotações, pedidos, entregas, pendências e vínculo a obra/atividade.
11. **Mudanças e aditivos:** solicitação, motivo, impacto em escopo/prazo/custo, aprovações e trilha de auditoria.
12. **Qualidade, entrega e encerramento:** inspeções, não conformidades, correções, comissionamento, recebimentos, as built, manuais, garantias e fechamento financeiro.
13. **Alertas e histórico:** atrasos, vencimentos, aprovações pendentes, trilha de alterações e documentos.

### Fora de escopo sugerido para a primeira versão
- App nativo de celular (propor interface web responsiva e captura de fotos pelo navegador).
- Estoque institucional completo (propor acompanhar compras e materiais vinculados a cada obra).
- Chat interno (propor comentários e registros vinculados à obra/atividade, sem substituir WhatsApp como mensageiro nesta primeira fase).

### Pontos a fechar na etapa 1
- [AINDA NÃO RESPONDIDO] Custo semanal em horas ou reais da consolidação e cobranças.
- [AINDA NÃO RESPONDIDO] Definição do valor que forma o numerador do indicador de custo percentual (medido, aprovado, pago ou outro).
- [AINDA NÃO RESPONDIDO] O que o gestor faz primeiro ao abrir o painel diário.
- [AINDA NÃO RESPONDIDO] Acesso de cada perfil a valores, contratos, documentos e obras; quem pode excluir registros.
- [AINDA NÃO RESPONDIDO] Possibilidade de usuários trabalharem em várias obras (presumida provável; confirmar).
- Regra registrada: responsáveis da execução podem ser adicionados conforme o avanço, com nomes provenientes dos cadastros.
- [AINDA NÃO RESPONDIDO] Prazo desejado e horas semanais disponíveis.
- [AINDA NÃO RESPONDIDO] Faixa de custo aceitável para sistema pronto.

## Etapas seguintes
Etapa 2 — mercado e referências visuais: [AINDA NÃO INICIADA]
Etapa 3 — arquitetura, telas, entidades, campos, fórmulas e riscos: [AINDA NÃO INICIADA]




