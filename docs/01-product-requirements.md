# Product Requirements — MyMedLog MVP

## 1. Visao do Produto

Aplicativo PWA pessoal para Android, focado em controle de medicamentos, validade e lembretes de tomada, com funcionamento offline e estrategia local-first.

## 2. Objetivo do MVP

Permitir que o usuario:
1. Cadastre medicamentos manualmente.
2. Registre validade dos medicamentos.
3. Configure lembretes por horarios fixos e por intervalos.
4. Receba alertas de validade em modo unico ou multiplo.
5. Use o app sem internet, mantendo operacao local completa.

## 3. Escopo Funcional (In Scope)

### 3.1 Cadastro de medicamento
- Criar medicamento com os campos:
  - `name`
  - `expiration_date` (opcional)
  - `schedule_type_and_times`
- Editar medicamento existente.
- Remover medicamento.

### 3.2 Agendamento de lembretes
- Suportar dois tipos de agenda:
  - Horarios fixos diarios (ex.: 08:00, 20:00).
  - Intervalo recorrente (ex.: a cada 6h, 8h, 12h).
- Permitir ativar/desativar lembretes por medicamento.

### 3.3 Alertas de validade
- Modo unico:
  - Usuario define 1 antecedencia (ex.: 30 dias antes).
- Modo multiplo:
  - Usuario define multiplas antecedencias (ex.: 30, 7, 1 e no dia).
- Disparo tambem no dia da expiracao (quando configurado).

### 3.4 Notificacoes no Android (PWA)
- Exibir notificacao push/local quando possivel no contexto PWA.
- Tentar usar som e vibracao conforme capacidade/permissoes do dispositivo.
- Registrar estado de permissao de notificacoes no app.

### 3.5 Offline-first e sincronizacao futura
- App deve funcionar localmente sem backend.
- Dados e agendamentos devem permanecer utilizaveis offline.
- Sincronizacao com backend sera manual por acao explicita do usuario.
- Botao `Save data` envia snapshot completo local e sobrescreve backend.
- Botao `Load data` carrega backend e sobrescreve dados locais, limpando pendencias locais.

## 4. Fora de Escopo do MVP (Out of Scope)

- Autenticacao/login/PIN/biometria.
- Historico de doses (tomado/pulado/soneca).
- Alertas de estoque baixo.
- Cadastro por barcode/scan.
- Multi-idioma (MVP sera interface em portugues).
- Multiusuario/familia.

## 5. Requisitos Nao Funcionais

### 5.1 Plataforma e UX
- Plataforma principal: Android via PWA.
- Interface em portugues.
- Codigo-fonte em ingles.
- Experiencia responsiva para mobile-first.

### 5.2 Confiabilidade
- Operacao local deve ser resiliente sem internet.
- Dados persistidos localmente devem sobreviver a reinicio do app.
- Falha de backend nao pode bloquear uso core.

### 5.3 Manutenibilidade
- Regras de lembrete e validade devem ser isoladas em modulos claros.
- Estrutura preparada para evolucao (ex.: barcode e sync completo).

## 6. Regras de Negocio (MVP)

1. Um medicamento deve possuir todos os campos minimos preenchidos para ser salvo.
2. `expiration_date`, quando informado, deve ser data valida.
4. Horarios fixos aceitam 1..N horarios por dia.
5. Intervalo aceita valores predefinidos no MVP: 6h, 8h, 12h.
6. Alertas de validade nao podem ter valores negativos.
7. Se modo multiplo estiver ativo, lista de dias deve ser sem duplicatas.
8. Se notificacoes estiverem sem permissao, app deve orientar habilitacao sem bloquear demais funcoes.

## 7. Criterios de Aceite (MVP)

### CA-01 Cadastro
- Dado um usuario no app,
- Quando ele preenche os campos minimos validos,
- Entao o medicamento e salvo localmente e aparece na lista.

### CA-02 Edicao
- Dado um medicamento existente,
- Quando o usuario altera nome/validade/agendamento,
- Entao os novos dados persistem localmente.

### CA-03 Lembrete por horario
- Dado medicamento com horarios fixos,
- Quando chega o horario configurado,
- Entao o app dispara notificacao conforme permissoes disponiveis.

### CA-04 Lembrete por intervalo
- Dado medicamento com intervalo configurado,
- Quando o tempo de intervalo e atingido,
- Entao o app dispara notificacao conforme permissoes disponiveis.

### CA-05 Validade modo unico
- Dado medicamento com alerta unico de validade,
- Quando a antecedencia definida e atingida,
- Entao o app dispara notificacao de validade.

### CA-06 Validade modo multiplo
- Dado medicamento com multiplas antecedencias,
- Quando cada antecedencia e atingida,
- Entao o app dispara notificacao para cada marco.

### CA-07 Offline
- Dado backend indisponivel e sem internet,
- Quando o usuario abre e utiliza o app,
- Entao cadastro, edicao e leitura continuam funcionando localmente.

### CA-08 Sem login
- Dado o MVP em execucao,
- Quando o usuario abre o app,
- Entao nao ha fluxo de autenticacao obrigatorio.

### CA-09 Save data manual
- Dado alteracoes locais pendentes,
- Quando o usuario clica em `Save data`,
- Entao o app envia snapshot completo local e sobrescreve o backend.

### CA-10 Load data manual
- Dado dados no backend,
- Quando o usuario clica em `Load data`,
- Entao o app substitui dados locais pelos dados do backend e limpa pendencias locais.

## 8. Restricoes Tecnicas Iniciais

- Implementacao como PWA.
- Prioridade para APIs web compativeis com Android moderno.
- Estrategia local-first obrigatoria.
- Arquitetura preparada para sync eventual sem reescrita do dominio.

## 9. Riscos Iniciais e Mitigacao

1. Limitacoes de notificacoes em background em PWA.
   - Mitigacao: documentar capacidades reais por navegador/dispositivo e projetar fallback.
2. Complexidade de lembretes por intervalo offline.
   - Mitigacao: separar motor de agenda e criar testes de regra temporal.
3. Divergencia entre estado local e backend no futuro sync.
   - Mitigacao: definir IDs estaveis, versionamento de registros e politica de conflito desde cedo.

## 10. Definicao de Pronto (Definition of Done) — MVP

- Requisitos funcionais in-scope implementados.
- Criterios de aceite CA-01..CA-08 validados.
- Build PWA instalavel em Android.
- Fluxo offline validado manualmente.
- Documentacao minima de arquitetura, modelo de dados e estrategia de sync concluida.
