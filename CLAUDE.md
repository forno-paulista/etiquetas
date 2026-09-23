# Sistema de Rastreabilidade de Produtos/Insumos — Rede de Pizzarias

> Documento de contexto consolidado, gerado a partir de uma sessão de desenho de sistema.
> Objetivo: servir como base para o desenvolvimento deste repositório.

---

## 1. Contexto do negócio

- Empresa: rede de pizzarias com **1 Centro de Distribuição (CD)** e **4 lojas**.
- Sistemas já existentes:
  - **Saipos**: usado nas 4 lojas. Controla **estoque operacional das lojas**, fichas técnicas, vendas e baixa automática de ingredientes por venda. Possui **API pública apenas de leitura/consulta** — não há API de escrita.
  - **Varejo Fácil**: usado no CD. Controla o **estoque do CD**. Possui **API de leitura e escrita** — permite registrar ajustes/baixas programaticamente.
- O sistema a ser construído é **complementar**, não um ERP e não substitui Saipos nem Varejo Fácil.

## 2. Problema a resolver

Falta controle granular sobre:
- lote, validade, quantidade, localização de produtos/insumos;
- transferências entre CD e lojas;
- produtos próximos ao vencimento ou vencidos;
- descartes (validade, avaria, perda, contaminação, outros);
- rastreabilidade de produtos que são **transformados** (porcionamento) no CD ou nas lojas.

## 3. Conceito central

O **QR Code representa um lote específico**, não um produto genérico. Um produto pode ter N lotes ativos simultâneos, cada um rastreável individualmente.

Estrutura conceitual: `Produto → Lote → Quantidade → Validade → Localização → QR Code`

O QR Code carrega **apenas um identificador** (URL curta apontando para o lote no sistema), nunca os dados do lote embutidos diretamente — a fonte de verdade é sempre consultada no sistema no momento do scan.

## 4. Escopo do MVP

**Dentro do MVP:**
- Cadastro de produto (com grupo/subgrupo, ex. "Frios > Laticínios"), unidade de medida, fornecedor
- Recebimento (CD e loja) com geração de lote
- Etiqueta com QR Code (geração + impressão) — reimprimível por pacote/quantidade, sem virar entidade nova (regra 13)
- Consulta de lote via QR Code (web responsiva)
- Transferência CD ↔ Loja com confirmação de recebimento
- Produção/porcionamento (consumo de lote(s) de matéria-prima → novo lote de produto porcionado), em qualquer local (CD ou loja)
- Consumo/baixa manual de lote na loja (regra 14)
- Contagem (inventário físico) com geração de Ajuste de Contagem
- Alertas de validade (painel, faixas configuráveis)
- Descarte com motivo, gerando ajuste automático (Varejo Fácil) ou fila manual (Saipos)
- Histórico/auditoria completo de tudo acima

**Fora do MVP (fase 2+):**
- Relatórios analíticos de perdas com dashboards/gráficos (fica com dado bruto navegável no MVP)
- Notificações automáticas (e-mail/WhatsApp) de vencimento
- App mobile nativo publicado nas lojas de apps (MVP é PWA; nativo vem depois via Capacitor, sem reescrever)
- Reimpressão em lote / layout de etiqueta customizável
- Endereçamento detalhado de estoque dentro do CD
- Rastreamento fiscal de NF (campo existe no modelo, mas não é obrigatório nem usado no MVP)

**Explicitamente fora de escopo (não será construído):**
- ERP completo, sistema financeiro, sistema de vendas, PDV
- Fichas técnicas concorrentes ao Saipos
- Gestão de compras completa, WMS complexo

## 5. Regras de negócio

1. Todo QR Code representa um **lote**, nunca um produto genérico.
2. QR Code carrega apenas um **ID/URL**, nunca dados embutidos.
3. Quantidade de um lote **nunca é editada diretamente** — toda alteração nasce de um evento (Entrada, Transferência, Descarte, Produção, Ajuste de contagem). Histórico é append-only.
4. A quantidade de um lote no sistema **não representa o saldo físico exato em tempo real** — representa "quanto ainda não foi formalmente baixado por transferência/descarte/produção". Reconciliação real acontece por contagem física periódica (ver seção 9).
5. **FEFO é recomendação de UI**, não uma trava física — o sistema sinaliza qual lote consumir primeiro, mas não impede fisicamente o uso de outro lote.
6. Transferência só é "concluída" quando **confirmada na chegada** (scan no destino). Até lá, fica em estado "em trânsito".
7. Descarte sempre exige: lote, quantidade, motivo, local, usuário responsável — nunca solto sem vínculo a um lote.
8. Divergências (transferência ou contagem física) **nunca são corrigidas automaticamente** — sempre viram um evento visível para revisão humana.
9. Produção pode consumir **mais de um lote de origem** (suporte a N:N desde o início, mesmo que hoje normalmente seja 1 lote por produção).
10. Validade (de Recebimento ou da saída de uma Produção) é **sempre editável manualmente** — mas se o usuário não informar, o sistema calcula sozinho a partir da `validadePadraoDias` cadastrada no produto (ex.: queijo = 7 dias por padrão), contada a partir da data de recebimento/fabricação. Sem informar e sem padrão cadastrado, o sistema exige o valor (não adivinha do nada). Objetivo: reduzir digitação repetitiva no dia a dia da cozinha, sem tirar a possibilidade de ajuste manual caso a caso.
11. Consumo de matéria-prima em uma Produção pode ter **origem desconhecida** (ex.: sobra antiga, item que não passou pelo fluxo de recebimento do sistema) — nesse caso, `lote_origem_id` é nulo, mas `origem_desconhecida = true` e uma descrição textual são obrigatórias. Nunca um consumo sem explicação.
12. A promessa de rastreabilidade do sistema é: **"completa para tudo que entrou pelo fluxo de recebimento do sistema, com gaps explicitamente marcados quando a origem é desconhecida"** — não uma promessa de rastreabilidade absoluta.
13. **Empacotamento físico (ex.: um "sacão" com N porcionados) não é uma entidade própria no sistema** — é reimpressão da etiqueta/QR do mesmo `Lote`, com a quantidade daquele pacote específico anotada na etiqueta impressa (ex.: "10 un / 700g" no sacão vs. "1 un / 70g" em cada porcionado individual). Consistente com o rastreio agregado por lote (regra 4) — o sistema não precisa saber qual unidade física específica é qual, só a quantidade total do lote. **"Produto solto" (item avulso, sem agrupamento) já funciona do mesmo jeito, sem nada especial** — é só um `Lote` com `quantidade` pequena (inclusive 1); nunca existiu uma trava de "precisa ser um grupo/container" no modelo.
14. Consumo/uso operacional de um lote na loja (ex.: retirar um porcionado da câmara fria pra usar) gera `MovimentoLote` tipo `CONSUMO` — mesma mecânica de tela do `Descarte` (buscar/escanear lote, informar quantidade, registrar), mas **não é perda**: não exige motivo, não aciona `VarejoFacilStockProvider` nem `AjustePendente`. **Não precisa ser lançado no momento exato do uso** — o registro guarda só lote + quantidade + quem lançou + quando foi *registrado* (não quando foi fisicamente usado), então o lançamento pode ser em lote no fim do turno/dia, sem parar a operação pra escanear cada unidade retirada. Existe separado da baixa automática de venda do Saipos (que já não é rastreada por lote, ver seção 9) — é um registro manual complementar, não uma tentativa de sincronizar com o Saipos.

## 6. Fluxos principais

### Recebimento
```
Selecionar Local (CD ou Loja)
→ Selecionar/cadastrar Produto
→ Preencher: Fornecedor (opcional), código do Lote, Quantidade, Unidade,
  Data Fabricação (opcional), Validade, Data Recebimento
→ Sistema cria Lote + registra MovimentoLote (ENTRADA)
→ Sistema gera QR Code vinculado ao lote
→ Impressão da etiqueta
```

### Produção / Porcionamento
```
Selecionar Produto de saída (ex.: "Mussarela porcionada 200g")
→ Selecionar 1+ lotes de origem (matéria-prima) e quantidade consumida de cada
  (ou marcar origem desconhecida + descrição, se aplicável)
→ Definir quantidade produzida e validade de saída (manual)
→ Sistema cria novo Lote (saída) + novo QR Code
→ Sistema registra MovimentoLote (PRODUCAO_CONSUMO) nos lotes de origem
→ Sistema registra MovimentoLote (PRODUCAO_ENTRADA) no lote de saída
→ ConsumoProducao vincula lote de saída aos lotes de origem (genealogia)
```

### Transferência CD ↔ Loja
```
Selecionar lote(s) e quantidade a enviar (sistema sugere ordem FEFO)
→ Confirmar quantidade e local de destino
→ Sistema cria Transferencia (status: EM_TRANSITO)
→ Saldo decrementado na origem
→ Destino escaneia QR Code do lote ao receber
→ Confirma quantidade recebida (pode divergir → status DIVERGENTE)
→ Transferencia muda para CONCLUIDA (ou fica em revisão se divergente)
→ Saldo do lote passa a existir também no local de destino
```

### Alertas de validade
```
GET /alertas-validade (calculado na hora da consulta, não um job/tabela) →
→ Filtra lotes com saldo > 0 (opcionalmente por local)
→ Classifica em: vencidos, vence hoje, vence amanhã, próximos N dias (padrão 7, configurável)
→ Painel por local (tela "Dashboard", seção 11 — estilo Suflex: contadores por faixa)
```

### Descarte
```
Scan do QR Code do lote
→ Preencher: quantidade a descartar, motivo, local
→ Sistema registra Descarte (append-only) + decrementa saldo do lote
→ Se local = CD → chama VarejoFacilStockProvider.registrarAjuste() automaticamente
→ Se local = Loja → cria item na fila AjustePendente daquela loja
→ Responsável lança manualmente no Saipos depois e marca como "ajustado"
```

### Consumo/Baixa na loja
```
Buscar/escanear o lote (feito em lote/lançamento único, ex. no fim do dia
ou turno — não precisa parar a produção pra escanear cada porcionado no
momento em que é retirado)
→ Informar quantidade total usada naquele período
→ Sistema registra MovimentoLote (CONSUMO) + decrementa saldo do lote
  (sem motivo, sem acionar StockProvider nem AjustePendente — regra 14)
```

### Contagem (inventário físico)
```
Selecionar lote (scan ou busca) ou lista de contagem por local
→ Informar quantidade contada fisicamente
→ Sistema compara com SaldoLote atual
→ Se diferente: registra MovimentoLote (AJUSTE_CONTAGEM) com a diferença,
  motivo textual livre, sem tentar adivinhar a causa (regra 8)
→ SaldoLote passa a refletir a contagem
```

## 7. Modelo de dados (visão relacional)

```
Organizacao
  └─ Local (tipo: CD | Loja)

Grupo (categoria de produto, ex.: "Frios" > "Laticínios" — 2 níveis: grupo e subgrupo opcional)
  ├─ nome, ícone
  └─ grupo_pai_id (nullable — se preenchido, este é um subgrupo)

Produto
  ├─ unidade_medida
  ├─ grupo_id (nullable)
  ├─ validade_padrao_dias (nullable — regra 10, preenche a validade quando não informada)
  └─ MapeamentoProdutoExterno (produto_local_id ↔ produto_saipos_id / produto_varejofacil_id)

Fornecedor

Lote
  ├─ produto_id
  ├─ fornecedor_id (nullable)
  ├─ codigo_lote (opcional, texto livre, sem exigência de unicidade — ver § 18.5, item 8)
  ├─ data_fabricacao (nullable)
  ├─ data_validade
  ├─ qr_code_id (chave pública usada no QR — não muda mesmo que a quantidade varie)
  └─ created_at, created_by

SaldoLote  (projeção/cache por local — recalculável a partir de MovimentoLote)
  ├─ lote_id
  ├─ local_id
  └─ quantidade_atual

MovimentoLote  (append-only — fonte de verdade, nunca editado/apagado)
  ├─ lote_id
  ├─ tipo (ENTRADA | TRANSFERENCIA_SAIDA | TRANSFERENCIA_ENTRADA |
  │        DESCARTE | PRODUCAO_CONSUMO | PRODUCAO_ENTRADA | AJUSTE_CONTAGEM |
  │        CONSUMO)
  ├─ quantidade (+/-)
  ├─ local_origem_id, local_destino_id (conforme tipo)
  ├─ referencia_id (aponta para Entrada, Transferencia, Descarte ou Producao que originou)
  ├─ observacao (texto livre — obrigatório em AJUSTE_CONTAGEM, regra/seção 10; opcional nos demais)
  ├─ usuario_id
  └─ timestamp

Transferencia
  ├─ lote_id, quantidade
  ├─ local_origem_id, local_destino_id
  ├─ status (EM_TRANSITO | CONCLUIDA | DIVERGENTE)
  ├─ quantidade_confirmada (nullable até chegada)
  ├─ natureza (INTERNA | VENDA_INTERCOMPANY)
  ├─ referencia_fiscal (nullable — nº NF; existe no modelo, não usado no MVP)
  └─ usuario_envio_id, usuario_recebimento_id

Producao
  ├─ produto_saida_id
  ├─ lote_saida_id
  ├─ quantidade_produzida
  ├─ validade_saida (input manual)
  ├─ local_id (CD ou qualquer Loja)
  └─ usuario_id, data

ConsumoProducao  (1:N — suporta múltiplos lotes de origem)
  ├─ producao_id
  ├─ lote_origem_id (nullable)
  ├─ origem_desconhecida (boolean)
  ├─ descricao_origem (texto livre, obrigatório se origem_desconhecida = true)
  └─ quantidade_consumida

Descarte
  ├─ lote_id, quantidade, motivo_id
  ├─ local_id, usuario_id, data
  └─ status_ajuste_externo (PENDENTE | ENVIADO_FILA | AJUSTADO_NO_ERP | NAO_APLICAVEL)

MotivoDescarte (validade, avaria, perda, contaminação, outros — tabela configurável)

AjustePendente  (fila específica para lojas/Saipos, já que não há API de escrita lá)
  ├─ descarte_id
  ├─ local_id
  ├─ status (PENDENTE | LANCADO_MANUALMENTE)
  └─ usuario_que_marcou_id, data

Usuario
  ├─ papel (Admin | Gestor CD | Gestor Loja | Operador)
  └─ locais_acesso (N:N — um usuário pode ter acesso a 1+ locais)

IntegracaoExterna
  ├─ tipo (SAIPOS | VAREJO_FACIL)
  ├─ local_id (Saipos é por loja; Varejo Fácil é do CD)
  └─ configuração de credenciais/endpoint

Auditoria (log genérico — quem, o quê, quando, valores antes/depois)
```

## 8. Arquitetura

```
Frontend (React + Capacitor — PWA hoje, empacotável como app nativo depois)
        │ REST/HTTP
Backend / API (NestJS — regras de negócio, auth)
        │
   ┌────┴─────┐
PostgreSQL   Integration Layer
             ┌──────┴───────┐
    SaiposStockProvider   VarejoFacilStockProvider
    (somente leitura)     (leitura + escrita)
```

- `StockProvider`: interface comum (`consultarSaldo`, etc.). Escrita fica numa interface separada (`WritableStockProvider extends StockProvider`) que só `VarejoFacilStockProvider` implementa — `SaiposStockProvider` não a implementa (ou lança "não suportado").
- **Nenhuma regra de domínio (Lote, Transferência, Descarte, Produção) conhece "Saipos" ou "Varejo Fácil" diretamente** — só conhece a interface `StockProvider`. Trocar de ERP = trocar a implementação injetada.
- Mapeamento de produto entre sistemas é manual (`MapeamentoProdutoExterno`), não há necessidade de sincronizar catálogo inteiro.
- **`LabelPrinterProvider`**: mesmo padrão de interface aplicado à impressão de etiqueta. Nenhuma regra de domínio (Recebimento, Produção) sabe *como* a etiqueta é impressa, só que existe uma etiqueta pra imprimir a partir de um `Lote` + quantidade. Motivo: um navegador não fala diretamente o protocolo de impressoras térmicas (ZPL) por segurança — existem pelo menos 3 formas de imprimir (driver do SO via diálogo de impressão do navegador, agente de impressão local na rede que fala ZPL com a impressora, ou geração de PDF manual), e a empresa ainda não decidiu qual hardware vai usar após sair da Suflex (que hoje aluga impressora + etiqueta BOPP, seção 18.1). Implementação inicial planejada: `BrowserPrintProvider` (HTML/CSS formatado no tamanho da etiqueta + diálogo nativo do navegador) — mais simples, cobre o MVP. Trocar para impressão térmica direta (ZPL) depois é só trocar a implementação injetada, sem tocar no domínio.

## 9. Estratégia de sincronização (ponto arquitetural mais delicado)

- A quantidade de um lote no sistema **não é** o saldo físico exato — é um teto superior ("quanto ainda não foi formalmente baixado").
- Consumo por venda (baixa da ficha técnica no Saipos) **não decrementa lote nenhum automaticamente** — o Saipos não sabe de qual lote a venda saiu, não faz sentido tentar inferir isso.
- Reconciliação real acontece por **contagem física periódica** (inventário): usuário conta o que sobrou de um lote, lança um `AJUSTE_CONTAGEM`, sistema aceita esse número como verdade e registra a diferença como movimento auditável — **sem tentar adivinhar a causa da diferença**.
- Isso é uma limitação consciente e comunicada: o sistema garante rastreabilidade (origem, destino, validade, descarte), não garante saldo em tempo real 100% preciso sem contagem física.

## 10. Tratamento de divergências

1. **Transferência**: quantidade enviada ≠ confirmada na chegada → status `DIVERGENTE`, visível em painel até um gestor resolver (ex.: gerar um Descarte separado para a perda).
2. **Contagem física vs. sistema**: vira `AJUSTE_CONTAGEM`, sempre com motivo textual livre, sem automação de causa.

Nenhuma divergência é absorvida silenciosamente.

## 11. Telas (MVP)

- Login
- Dashboard (alertas de validade por faixa, resumo por local)
- Recebimento (formulário + impressão de etiqueta)
- Consulta de Lote (via scan ou busca — histórico completo)
- Produção/Porcionamento (seleção de lote(s) de origem + geração de novo lote)
- Transferência — Enviar (CD/loja, sugestão FEFO)
- Transferência — Receber (scan + confirmação de quantidade)
- Consumo/Baixa (lançamento em lote no fim do turno/dia, mesma mecânica do Descarte — regra 14)
- Contagem (seleção de lote(s) + quantidade contada, gera Ajuste de Contagem)
- Descarte (scan + formulário)
- Fila de Ajustes Pendentes (por loja)
- Relatório de Movimentações (filtro por produto/local/período/tipo — dado bruto)
- Administração (produtos, grupos/subgrupos, fornecedores, motivos de descarte, usuários, locais)

## 12. Permissões

| Papel | Escopo | Pode |
|---|---|---|
| Admin | Todos os locais | Tudo, incl. cadastros e config de integração |
| Gestor CD | CD | Recebimento, transferência (envio), descarte, produção, ver ajustes automáticos no Varejo Fácil |
| Gestor Loja | Sua loja | Recebimento local, produção, confirmar transferência, descarte, gerenciar fila de ajustes Saipos da própria loja |
| Operador | Sua loja/CD | Recebimento, descarte, confirmar transferência — sem relatórios/config |

**Leitura de cadastros (produtos, locais, fornecedores, grupos, motivos de descarte) é liberada pra qualquer papel autenticado** — todo mundo precisa consultar essas listas pra preencher os formulários de Recebimento/Descarte/etc. Só criar/editar cadastro continua exclusivo de Admin.

## 13. QR Code

- Formato: URL curta (`https://.../l/{codigo_curto}`), nunca JSON embutido.
- **Decisão revertida (2026-09-22): a consulta por QR Code exige login, sempre — não existe mais visualização pública/sem autenticação.** O plano original (visualização básica sem login, só ações sensíveis autenticadas) foi trocado a pedido do usuário: é uso interno, não deve ser acessível por qualquer um que ache uma etiqueta. `GET /lotes/qr/:qrCodeId` deixou de ser `@Public()`; o rate limiting mais apertado que existia especificamente por ser endpoint público também foi removido (o limite geral da API já cobre).
- QR Code gerado uma vez na criação do lote, não muda mesmo que a quantidade varie.
- Etiqueta impressa mostra: nome do produto, lote, validade, quantidade original, QR Code — é uma "foto do momento", a fonte de verdade é sempre o sistema.

## 14. Integrações

- **Saipos**: somente leitura. Usado como referência de conferência, nunca para escrever. Descarte em loja → fila `AjustePendente` (lançamento manual depois).
- **Varejo Fácil**: leitura + escrita. `VarejoFacilStockProvider.registrarAjuste()` chamado automaticamente a cada descarte no CD — sem fila manual.
- Se o Saipos algum dia expuser API de escrita: troca-se apenas a implementação de `SaiposStockProvider`, sem alterar o domínio.

## 15. Stack tecnológico recomendado

```
Frontend:  React + Capacitor (roda como PWA agora; empacotável como app
           nativo — Play Store/App Store — depois, sem reescrever)
           Leitura de QR: html5-qrcode (web) / câmera nativa via Capacitor (app)
           Geração de QR: lib "qrcode"

Backend:   Node.js + TypeScript + NestJS
           (alternativa: Python + FastAPI, se preferir)

Banco:     PostgreSQL + Prisma (ORM)

Auth:      JWT (expiração curta + refresh token)
           Senha: bcrypt ou argon2

Segurança: HTTPS obrigatório em produção
           Checagem de papel + local sempre no backend (nunca confiar só no frontend)
           Rate limiting geral na API (não há mais endpoint público de QR — seção 13)
           Logs de auditoria gravados em banco (não só arquivo)

Infra:     Docker (backend + Postgres em containers)
           VPS (DigitalOcean/Hetzner) ou banco gerenciado (Neon/Supabase)
           Backup automático do banco (pg_dump agendado, se auto-hospedado)
```

## 16. Perfil de quem desenvolve

- Desenvolvedor único (o próprio solicitante), com conhecimento de programação.
- Prioridade: sistema seguro, com backend robusto, e um módulo mobile que comece como PWA e evolua para app instalável nas lojas de apps via Capacitor — sem reescrever o frontend.

## 17. Pontos ainda em aberto (para decidir durante o desenvolvimento)

- **Hardware de impressão**: a empresa vai continuar alugando impressora/etiqueta da Suflex, comprar impressora térmica própria, ou usar impressora comum? Define se `LabelPrinterProvider` (seção 8) precisa de suporte a ZPL/agente local desde já ou se `BrowserPrintProvider` (impressão via navegador) resolve por enquanto.
- Layout final da etiqueta (dimensões — Suflex usa ~60×60mm BOPP).
- Regras específicas de expiração de token / política de sessão.
- Se e quando implementar notificações automáticas (e-mail/WhatsApp) de validade.
- Se vale a pena, no futuro, registrar `referencia_fiscal` de fato (hoje o campo existe mas não é usado).
- Detalhamento de relatórios analíticos de perdas (fase 2+).

---

**Princípio geral de projeto**: evitar overengineering, manter uso operacional simples, e desenhar a arquitetura (especialmente a camada de integração `StockProvider`) para ser extensível sem exigir reescrita do domínio se o ERP mudar no futuro.

---

## 18. Sistema atual a substituir: Suflex (app.foodcamp.com.br)

A empresa usa hoje o **Suflex** (roda sobre a plataforma "Foodcamp") para
etiquetagem/validade. Este sistema é o substituto dele. Mapeamento feito em
duas passadas: primeiro o site público `suflex.com.br` (planos, hardware,
FAQ), depois a **conta real da empresa** (unidade "Forno Paulista",
Teresina/PI, CNPJ 27.963.929/0001-72) — essa segunda passada é a que vale
mais, porque mostra o que é efetivamente usado, não o que é vendido.

### 18.1 Comercial — planos (site público)

Essencial → Avançado → Diamante → Business:
- Essencial: Recebimento, Etiquetas, Controle de Validades, Relatório de Recebimento.
- Avançado: + Controle de Produção, Relatório de Produção.
- Diamante: + Contagem, "Controlados" (itens com estoque mínimo monitorado), Histórico de Contagem, Painel de Controle de Controlados.
- Business: "pra quem possui mais de uma unidade" — pela FAQ deles, isso é contratar N licenças com um seletor de "Unidade" no topo da tela, não uma visão unificada de rede com CD.
- Hardware: etiqueta BOPP removível ~60×60mm. Impressora e etiquetas alugadas da Suflex, taxa de desinstalação de R$350 no cancelamento — confirmar com a empresa qual impressora física vai ser usada depois da migração (afeta formato/driver de impressão, ponto em aberto na seção 17).

**Confirmado nas duas passadas: não há transferência entre unidades, nem integração com ERP/PDV (Saipos, Varejo Fácil ou outro), nem API pública.** O núcleo arquitetural deste projeto (`Transferencia` CD↔loja e `StockProvider`) não tem equivalente no Suflex.

### 18.2 O que a conta real ("Forno Paulista") tem ativo hoje

A tela inicial mostra "Novos serviços" com **Contagem de produtos**,
**Produtos controlados** e **Recebimento de produtos** todos marcados
**"Disponível para contratação"** — ou seja, **essa unidade não usa
Recebimento nem Contagem no Suflex hoje**. Só está ativo: Etiquetas
(impressão avulsa e em grupo), Produção (visualização/relatório) e
Validades (monitoria). Isso importa: não existe um fluxo de Recebimento
real no Suflex pra "copiar" — se a empresa recebe insumo hoje, é por fora
do sistema (planilha/papel/verbal). Vale confirmar com o usuário como o
recebimento é feito na prática agora, pra não desenhar o nosso Recebimento
baseado em uma suposição errada.

### 18.3 Modelo de dados observado (mais granular do que eu tinha assumido)

- **`Produto` tem N `MétodoConservação`, cada um com sua própria validade**
  (dias/horas/minutos) — não é "um produto, uma validade". Ex.: a mesma
  família de produto pode ter variante "Resfriado" (7 dias) e "Congelado"
  (30 dias), cada uma configurada separadamente no cadastro do produto
  (dropdown de método + campos Dias/Horas/Minutos + checkbox "exibir
  horário na etiqueta"). → Nosso `Lote` guarda validade fixa; o que falta
  é isso estar no `Produto`/cadastro como *default configurável por método
  de conservação*, não só um valor livre digitado a cada recebimento.
- **`Produto` tem campo SIF opcional** (nº de inspeção federal — carnes) e
  campo Marca/fornecedor livre (texto, não FK pra um cadastro de
  fornecedor — diferente do nosso modelo, que tem `Fornecedor` como
  entidade própria).
- **`Grupo`/`Subgrupo`**: produtos são organizados em grupos com ícone
  (Carnes Processadas, Embutidos, Laticínios, Molhos, Processados,
  Proteínas) e suporte a 2 níveis (grupo → subgrupo, não usado nesta
  unidade). Nosso modelo não tem um equivalente a `Grupo` — hoje é uma
  lista plana de `Produto`. Vale avaliar se compensa adicionar categoria
  pra organizar a tela de seleção de produto (a Suflex usa isso como
  filtro/navegação na hora de imprimir etiqueta em grupo).
- **Etiqueta impressa ≠ Lote nosso**: quando imprime "N etiquetas" de um
  produto, **cada etiqueta física recebe seu próprio QR Code individual**
  (ex. `#4A62CC`, `#23A947`, `#750136`...), todas listadas como "etiquetas
  associadas" dentro do registro da impressão em lote. Ou seja, a Suflex
  rastreia no nível de **unidade impressa**, não só no nível de
  "lote com uma quantidade agregada" como o nosso `Lote`/`SaldoLote`.
  **Isto é uma decisão de modelagem que precisa ser tomada**: nosso QR
  Code aponta pra um `Lote` com quantidade — se a operação real precisa
  saber "qual desses 10 pacotes específicos ainda está na câmara fria",
  o nosso modelo atual não responde isso (só sabe "restam N unidades do
  lote X", não quais). Perguntar pro usuário se granularidade por unidade
  física importa ou se agregado por lote é suficiente.
- **"Responsável" não é o usuário logado**: a tela de impressão pede pra
  escolher um nome de uma lista (ex. Nadielly Almeida, Patricia...) — e no
  cadastro de Funcionários, a maioria está marcada **"Colaborador sem
  login"** (só 3 de ~12 têm login de verdade: conta da unidade, do gestor,
  e do estoque). Ou seja, **atribuir responsabilidade por uma ação não
  exige autenticação** — reduz fricção no chão de fábrica. Isso é
  diferente do nosso modelo de `Usuario`/permissões (seção 12), onde toda
  ação é feita por um usuário autenticado. Vale considerar um campo
  "responsável" (texto/seleção, sem exigir login) separado do usuário
  autenticado que efetivamente operou a tela — parecido com como a Suflex
  faz.
- **Relatórios são assíncronos por e-mail**: "Exportar relatório" não
  baixa na hora — processa e manda um PDF pro e-mail cadastrado
  (`admfornopaulista@outlook.com` nesse caso), com aviso de que "pode
  levar alguns instantes". Padrão razoável pra copiar se os relatórios
  ficarem pesados (seção 11, "Relatório de Movimentações").

### 18.4 Campos da etiqueta impressa (real, não só marketing)

Nome do produto, método de conservação + peso (ex. "RESFRIADO / CAMARA
FRIA — 1100 g"), **MANIPULAÇÃO** (timestamp de quando foi processado) e
**VALIDADE** (timestamp calculado = manipulação + duração do método,
ambos com data **e hora**), RESP. (responsável, da lista sem login),
nome da unidade, CNPJ, endereço, QR Code, ID da etiqueta. Campos opcionais
preenchíveis no momento da impressão: Validade original (se o insumo já
veio de fábrica com validade própria), SIF, Lote (**campo de texto livre,
não obrigatório** — na prática frequentemente fica em branco; quem
rastreia de verdade é o QR Code individual da etiqueta, não um código de
lote digitado).
→ Implicação pra nossa seção 13: vale incorporar timestamp de manipulação
separado da validade, e método de conservação como parte do que aparece
na etiqueta — já estava anotado, confirmado agora com dado real.

### 18.5 Decisões resolvidas com o usuário (2026-09-22)

1. **Tela de Contagem**: entra no MVP (seção 11, fluxo descrito na seção 6).
2. **Granularidade de rastreio**: fica **agregada por lote** (não por
   etiqueta física individual). Empacotamento (sacão com N porcionados) é
   só reimpressão da mesma etiqueta/QR do lote — regra 13, seção 5.
3. **"Responsável"**: o modelo já exige usuário autenticado em toda ação
   (`usuario_id` em `Lote`, `MovimentoLote`, `Descarte` etc.) — isso já
   cobre a exigência do usuário ("responsável logado, ou pelo menos um
   campo pra escrever"). Nenhuma mudança de modelo necessária.
4. **Categoria/Grupo de produto**: confirmado, com 2 níveis (grupo e
   subgrupo, ex. "Frios > Laticínios") — adicionado à seção 7 (`Grupo`) e
   à seção 11 (Administração).
5. **Fluxo de Recebimento**: esclarecido pelo usuário com um exemplo
   concreto (CD recebe peça de queijo grande, validade original; porciona
   em P/M/G com validade própria definida na hora — já coberto pela regra
   10; lojas pedem suprimento ao CD, que transfere via `Transferencia`
   normal, seção 6). Não é um fluxo copiado do Suflex (que não tem
   Recebimento ativo nesta conta) — é definição própria do negócio.
6. **Consumo/baixa na loja**: confirmado. Novo tipo de movimento `CONSUMO`
   (regra 14, seção 5), com a mesma mecânica de tela do `Descarte`.
   Importante: **não é lançado em tempo real por unidade retirada** —
   inviável no meio da produção — é lançado em lote (ex.: fim do turno/dia,
   quantidade total usada de cada lote).
7. **Impressão de etiqueta**: interface `LabelPrinterProvider` (seção 8),
   implementação inicial via navegador (`BrowserPrintProvider`). Hardware
   final (impressora térmica própria vs. continuar com a Suflex vs.
   impressora comum) ainda em aberto — seção 17.
8. **Código do lote** (decisão de 2026-09-22, a partir de dúvida do
   usuário: "se não tiver, com que cria? gera um genérico?"): confirmado
   como **texto livre e opcional, sem exigência de unicidade** — segue o
   precedente real do Suflex (§ 18.4: lá também é campo livre, "quem
   rastreia de verdade é o QR Code individual da etiqueta, não um código
   de lote digitado"). Se o usuário não informar, o backend gera um código
   automático (`AUTO-YYMMDD-XXXX`) só pra a etiqueta não ficar com "Lote "
   em branco — não é uma tentativa de identificador único, e duas etiquetas
   podem legitimamente ter o mesmo `codigoLote` sem problema, porque quem
   identifica o lote de fato é o `qrCodeId`.

---

## Estado do repositório

- `backend/`: API NestJS + Prisma (schema de dados da seção 7 já modelado em `backend/prisma/schema.prisma`), com `Dockerfile` multi-stage (build → runtime) para rodar containerizado.
- `backend/src/auth/`: autenticação implementada — JWT de acesso curto + refresh token com rotação (tabela `RefreshToken`), senha com argon2, guards globais (`JwtAuthGuard` + `RolesGuard` via `APP_GUARD` — toda rota exige autenticação por padrão, endpoints públicos usam `@Public()`) e `LocalAccessGuard` por rota pra checar acesso por local (seção 12). `prisma/seed.ts` cria o usuário Admin inicial (`npm run db:seed`).
- `backend/src/usuarios/`: CRUD de usuários (criar, listar, buscar, atualizar papel/status/locais), restrito a `ADMIN` via `@Roles`. É como se cria login pra alguém além do Admin do seed. `PATCH /usuarios/:id/senha` redefine a senha (não existia forma de recuperar acesso de alguém que esqueceu a senha).
- `backend/src/relatorios/`: `GET /relatorios/movimentos?produtoId=&localId=&tipo=&dataInicio=&dataFim=` — Relatório de Movimentações (seção 11), dado bruto navegável, limitado a 300 resultados por consulta (sem paginação, não é prioridade no MVP). `localId` filtra por origem OU destino. `dataFim` de um `<input type="date">` vira fim do dia (23:59:59.999), não meia-noite — mesma armadilha de fuso do `formatarData` no frontend.
- Cadastros base implementados, todos restritos a `ADMIN`: `backend/src/locais/`, `backend/src/grupos/` (hierarquia de 2 níveis reforçada no service — tentar criar um 3º nível dá 400), `backend/src/fornecedores/`, `backend/src/motivos-descarte/`, `backend/src/produtos/` (com `grupoId` opcional).
- `backend/src/lotes/`: primeiro módulo de domínio de verdade. `POST /lotes` é o Recebimento (cria Lote + SaldoLote + MovimentoLote ENTRADA numa transação, protegido por `LocalAccessGuard`; `codigoLote` é opcional — se omitido, gera um automático via `common/codigo-lote.util.ts`, seção 18.5 item 8; validade padrão, quando não informada, conta a partir da `dataFabricacao` se ela foi preenchida, senão da data de recebimento, regra 10); `GET /lotes/:id` é a consulta autenticada com histórico completo; `GET /lotes/qr/:qrCodeId` é a consulta resumida via QR, também autenticada (dados básicos só — seção 13, não é mais público).
- `backend/src/producao/`: `POST /producao` consome N lotes de origem (conhecidos e/ou de origem desconhecida — regra 11) e gera um novo `Lote` + `MovimentoLote(PRODUCAO_ENTRADA/PRODUCAO_CONSUMO)`, tudo numa transação. Valida saldo suficiente de cada lote de origem antes de mexer em qualquer coisa.
- `backend/src/transferencias/`: `POST /transferencias` envia (decrementa saldo na origem na hora, status `EM_TRANSITO`); `PATCH /transferencias/:id/confirmar` recebe (incrementa saldo no destino pela quantidade *confirmada*, não a enviada — vira `CONCLUIDA` ou `DIVERGENTE`, nunca corrigido sozinho, regra 8). `LocalAccessGuard` foi generalizado pra reconhecer `localOrigemId`/`localDestinoId`, não só `localId`.
- `backend/src/lotes/`: `GET /lotes?produtoId=&localId=&comSaldo=` lista lotes com saldo (default só saldo > 0), ordenado por validade — é o que alimenta o seletor de lote em Transferência/Produção/Descarte/Consumo, já que não existia forma de buscar lote a não ser por `id` ou QR Code.
- `backend/src/consumo/`: `POST /consumo` registra baixa manual (regra 14) — só `MovimentoLote(CONSUMO)`, não tem tabela própria.
- `backend/src/descarte/` + `backend/src/ajustes-pendentes/`: `POST /descartes` decide `statusAjusteExterno` pelo tipo do local — CD vira `PENDENTE` (`VarejoFacilStockProvider` ainda não existe, ver seção 8), Loja vira `ENVIADO_FILA` + cria `AjustePendente`. `PATCH /ajustes-pendentes/:id/marcar-lancado` fecha o ciclo (fila da seção 11) e propaga `AJUSTADO_NO_ERP` de volta pro Descarte.
- `backend/src/contagem/`: `POST /contagem` só gera `MovimentoLote(AJUSTE_CONTAGEM)` se a contagem divergir do saldo — e exige `observacao` (campo novo em `MovimentoLote`, não existia antes) quando diverge, regra/seção 10. Sem divergência, não cria nada.
- `frontend/`: iniciado — Vite + React + TypeScript, Tailwind, React Router, TanStack Query. Capacitor ainda não entrou (só quando for empacotar como app nativo de verdade, seção 15 — a PWA não precisa disso pra existir).
  - `src/lib/apiClient.ts`: instância do axios com refresh automático de token no 401 (fila única de refresh, evita disparar vários em paralelo).
  - `src/context/AuthContext.tsx` + `ProtectedRoute`: sessão guardada no `localStorage` (trade-off consciente — o backend devolve os tokens no corpo, não em cookie httpOnly).
  - Telas prontas: Login, Dashboard (`/alertas-validade`, filtro por local, cards clicáveis, cada item da lista linka pra `/lotes/:id`), Produtos (`/admin/produtos`, CRUD com edição completa — nome, unidade, grupo, validade padrão —, só Admin, dropdown de grupo mostra subgrupos indentados), Grupos (`/admin/grupos`, CRUD de 2 níveis — grupo e subgrupo —, só Admin), Locais (`/admin/locais`, CRUD simples — nome/tipo —, só Admin), Fornecedores (`/admin/fornecedores`, CRUD simples — nome/CNPJ —, só Admin), Motivos de Descarte (`/admin/motivos-descarte`, CRUD simples, só Admin), Usuários (`/admin/usuarios`, cria login com papel + locais de acesso, edita, ativa/desativa, redefine senha inline, só Admin), Recebimento (`/recebimento`, gera o `Lote` + mostra a etiqueta com QR Code renderizado no cliente via lib `qrcode`; label de quantidade mostra a unidade de medida do produto selecionado; etiqueta mostra a quantidade recebida), Consulta de Lote — busca (`/lotes`, filtra por produto/local via `GET /lotes`) e detalhe (`/lotes/:id`, dados do lote + saldo por local + histórico completo de movimentos, é o `GET /lotes/:id`), Produção/Porcionamento (`/producao`, 1+ linhas de consumo — cada uma lote conhecido via `GET /lotes` ou origem desconhecida com descrição, regra 9/11), Transferência — Enviar (`/transferencias/enviar`, seleciona local origem/destino/produto/lote via `GET /lotes`, lote já vem ordenado FEFO) e Receber (`/transferencias/receber`, fila de `EM_TRANSITO` pros locais do usuário, confirma quantidade e mostra CONCLUIDA/DIVERGENTE — regra 8), Descarte (`/descarte`, scan/seleção de lote + motivo, mostra aviso de fila pendente quando é loja), Consumo (`/consumo`, mesma mecânica do Descarte sem motivo — mantém local/produto selecionado após cada registro, pensado pra lançar vários de uma vez no fim do turno, regra 14), Contagem (`/contagem`, compara a quantidade contada com o saldo do sistema no próprio formulário — só pede observação quando diverge, antes de submeter), Fila de Ajustes Pendentes (`/ajustes-pendentes`, lista `PENDENTE` dos locais do usuário, botão marca como lançado no Saipos), Relatório de Movimentações (`/relatorios/movimentacoes`, filtro por produto/local/tipo/período sobre `GET /relatorios/movimentos`, cada linha linka pro lote), Consulta de Lote via QR (`/l/:qrCodeId`, autenticada — é a página pro que o QR code aponta, mostra só o resumo, mas exige login, seção 13). Todas testadas de ponta a ponta no navegador contra o backend real.
  - `src/lib/formStyles.ts`: classes de formulário centralizadas (o bug do texto invisível em modo escuro veio de inputs sem `bg`/cor de texto explícitos — não repetir isso tela a tela).
  - Achado ao integrar: os 5 endpoints de cadastro (`locais`, `produtos`, `fornecedores`, `grupos`, `motivos-descarte`) estavam com `GET` restrito a `ADMIN` — corrigido pra liberar leitura a qualquer papel autenticado (só escrita continua Admin-only), porque os formulários de qualquer usuário precisam popular esses dropdowns.
- `docker-compose.yml`: sobe Postgres + backend juntos. É o mesmo compose usado local e em produção (VPS/VM na nuvem) — só muda o `.env`. Ver seção "Deploy" no `README.md`. Frontend ainda não entrou no compose (roda via `npm run dev` direto por enquanto).
- `prisma migrate deploy` roda automaticamente no boot do container do backend (`Dockerfile`, `CMD`). Válido para uma única réplica; reavaliar se algum dia escalar horizontalmente.
- **Todos os módulos de domínio do MVP (seção 4) estão implementados no backend e testados de ponta a ponta** (recebimento, produção, transferência, consumo, descarte, contagem) — **e o frontend agora cobre todas as telas da seção 11, sem exceção**. Falta só o que já estava listado como pendente na seção 17: `StockProvider` (Saipos/Varejo Fácil — precisa de detalhes reais da API, combinado com o usuário) e `LabelPrinterProvider` (hardware de impressão ainda não decidido).
- Rate limiting implementado (`@nestjs/throttler`): limite geral de 300 req/min por IP em toda a API (seção 15). O limite mais apertado que existia especificamente em `GET /lotes/qr/:qrCodeId` foi removido junto com a decisão de tornar o endpoint autenticado (seção 13) — não fazia mais sentido um limite à parte pra um endpoint que não é mais público.
- Trabalho a partir daqui é feito na branch `dev` (não em `main`) — PR fica aberto no GitHub até o usuário decidir mergear manualmente.

## Padrões de documentação

Este projeto é feito para ser retomado por outra pessoa no futuro (ou para
suportar integrações externas), então documentação não é opcional:

- **API**: todo endpoint novo é documentado com decorators do
  `@nestjs/swagger` (`@ApiTags`, `@ApiOperation`, `@ApiResponse`,
  `@ApiProperty` nos DTOs). A doc interativa sobe automaticamente em
  `/api/docs` (desabilitada quando `NODE_ENV=production`) — é o contrato
  vivo da API, deve refletir exatamente o que existe.
- **Contexto de negócio/arquitetura**: fica neste arquivo (`CLAUDE.md`).
  Decisões que mudam regra de negócio, modelo de dados ou arquitetura
  devem atualizar a seção correspondente aqui, não só o código.
- **Código**: sem comentário para explicar o óbvio. Comentário só quando
  existe uma regra de negócio não óbvia por trás do código (ex.: por que
  `MovimentoLote` é append-only, por que FEFO não trava fisicamente) —
  nesses casos, referenciar a regra da seção 5 em vez de reexplicá-la.
- **Integrações externas** (Saipos, Varejo Fácil): a interface
  `StockProvider`/`WritableStockProvider` e cada implementação concreta
  devem documentar, no próprio código-fonte, quais endpoints externos são
  usados, autenticação exigida e particularidades de cada API — é o ponto
  em que uma pessoa nova mais vai precisar de contexto.
