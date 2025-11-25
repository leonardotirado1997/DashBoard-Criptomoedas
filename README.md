# 📊 Dashboards Financeiros - Análise de Ativos

Dashboards interativos para análise de dados financeiros de ações e criptomoedas, desenvolvidos com HTML, CSS e JavaScript puro.

## 📋 Sobre o Projeto

Este projeto contém dois dashboards complementares para visualização e análise de dados financeiros:

### 1. Dashboard Financeiro Básico (`index.html`)
Dashboard principal para análise de dados financeiros de diferentes ativos (ações e criptomoedas). Os dados são carregados a partir do arquivo CSV `view_gold.csv` e apresentados através de gráficos, estatísticas e tabelas dinâmicas.

### 2. Dashboard DB & Finance Avançado (`dashboard_db_finance.html`)
Dashboard avançado focado em análise de banco de dados e métricas financeiras detalhadas. Utiliza o arquivo CSV `bquxjob_258b8606_19abcb83c97.csv` que contém dados históricos mais extensos (8495 registros) e métricas adicionais como ROC (Rate of Change) 14 dias e volume ratio.

## ✨ Funcionalidades

### 📊 Dashboard Básico (`index.html`)

#### 🔍 Filtros Interativos
- **Tipo de Mercado**: Filtre por Ações (STOCK) ou Criptomoedas (CRYPTO)
- **Ativo Específico**: Selecione um ativo específico para análise detalhada
- **Sinal de Tendência**: Filtre por sinal de tendência (NEUTRAL, etc.)

#### 📈 Estatísticas em Tempo Real
- **Total de Ativos**: Quantidade única de ativos no dataset
- **Preço Médio**: Média dos preços de fechamento
- **Retorno Médio**: Média dos retornos diários em percentual
- **Volatilidade Média**: Média da volatilidade de 7 dias

#### 📊 Visualizações Gráficas
1. **Distribuição por Tipo de Mercado**: Gráfico de pizza mostrando a proporção entre ações e criptomoedas
2. **Top 10 Ativos por Preço**: Gráfico de barras com os 10 ativos de maior preço
3. **Retorno Diário**: Gráfico de linha mostrando a evolução dos retornos
4. **Volatilidade 7 Dias**: Gráfico de barras com a volatilidade dos ativos

#### 📋 Tabela de Dados
- Tabela completa com todos os dados do CSV
- Busca por símbolo do ativo
- Formatação automática de valores monetários e percentuais
- Cores indicativas para valores positivos (verde) e negativos (vermelho)
- Informação sobre quantidade de registros exibidos

### 📊 Dashboard Avançado (`dashboard_db_finance.html`)

#### 🔍 Filtros Interativos Avançados
- **Tipo de Mercado**: Filtre por Ações (STOCK) ou Criptomoedas (CRYPTO)
- **Ativo Específico**: Selecione um ativo específico para análise detalhada
- **Sinal de Tendência**: Filtre por sinal de tendência (NEUTRAL, UPTREND, DOWNTREND)
- **Período**: Filtre por período temporal (7 dias, 30 dias, 90 dias, ou todos)

#### 📈 Estatísticas Avançadas
- **Total de Registros**: Quantidade total de registros no dataset
- **Ativos Únicos**: Quantidade de ativos distintos
- **ROC Médio (14d)**: Média do Rate of Change de 14 dias
- **Volume Ratio Médio**: Média da razão de volume de negociação

#### 📊 Visualizações Gráficas Avançadas
1. **Evolução Temporal de Preços**: Gráfico de linha temporal mostrando a evolução dos preços médios
2. **Distribuição de ROC 14 Dias**: Histograma mostrando a distribuição dos valores de ROC
3. **Análise de Volume Ratio**: Gráfico de barras com os top 15 ativos por volume ratio
4. **Top 10 Ativos por ROC 14d**: Gráfico de barras mostrando os ativos com melhor/menor ROC
5. **Correlação: Volatilidade vs Volume Ratio**: Gráfico de dispersão mostrando a relação entre volatilidade e volume
6. **Distribuição de Tendências**: Gráfico de pizza mostrando a distribuição de sinais de tendência

#### 📋 Tabela de Dados Detalhada
- Tabela completa com todas as colunas incluindo nome do ativo, ROC 14d e volume ratio
- Busca por símbolo ou nome do ativo
- Formatação automática de valores monetários e percentuais
- Cores indicativas para valores positivos (verde) e negativos (vermelho)
- Informação sobre quantidade de registros exibidos

#### 💡 Insights e Análises
- Cards informativos com análises automáticas dos dados
- Análise de registros e ativos únicos
- Análise de distribuição de ROC (positivo vs negativo)
- Análise de distribuição de tendências
- Análise de volume de trading

## 🚀 Como Usar

### Pré-requisitos
- Um navegador web moderno (Chrome, Firefox, Edge, Safari)
- Um servidor web local (para carregar o arquivo CSV)

### Instalação e Execução

1. **Clone ou baixe o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd <nome-do-diretorio>
   ```

2. **Inicie um servidor web local**

   **Opção 1: Python 3**
   ```bash
   python -m http.server 8000
   ```

   **Opção 2: Python 2**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Opção 3: Node.js (com http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Opção 4: PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Acesse os dashboards**
   - **Dashboard Básico**: `http://localhost:8000/index.html`
   - **Dashboard Avançado**: `http://localhost:8000/dashboard_db_finance.html`
   - Os dashboards serão carregados automaticamente

### ⚠️ Importante
Os dashboards precisam ser executados em um servidor web local porque utilizam `fetch()` para carregar os arquivos CSV. Abrir os arquivos HTML diretamente no navegador (file://) não funcionará devido às políticas de segurança do navegador (CORS).

## 📁 Estrutura do Projeto

```
.
├── index.html                    # Dashboard Financeiro Básico
├── dashboard_db_finance.html     # Dashboard DB & Finance Avançado
├── style.css                     # Estilos base (compartilhado)
├── style_db.css                  # Estilos complementares para dashboard avançado
├── script.js                     # Lógica do dashboard básico
├── script_db.js                  # Lógica do dashboard avançado
├── view_gold.csv                 # Arquivo de dados financeiros básico
├── bquxjob_258b8606_19abcb83c97.csv  # Arquivo de dados financeiros avançado
└── README.md                     # Este arquivo
```

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica do dashboard
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript (ES6+)**: Lógica de manipulação de dados e interatividade
- **Chart.js**: Biblioteca para criação de gráficos interativos

## 📊 Estrutura dos Dados

### Dashboard Básico - `view_gold.csv`

O arquivo CSV (`view_gold.csv`) contém as seguintes colunas:

| Coluna | Descrição |
|--------|-----------|
| `market_type` | Tipo de mercado (STOCK ou CRYPTO) |
| `asset_symbol` | Símbolo do ativo (ex: AAPL, BTC, ETH) |
| `ref_date` | Data e hora de referência |
| `close_price` | Preço de fechamento |
| `daily_return_pct` | Retorno diário em percentual |
| `sma_7d` | Média móvel simples de 7 dias |
| `sma_21d` | Média móvel simples de 21 dias |
| `volatility_7d` | Volatilidade de 7 dias |
| `drawdown_pct` | Drawdown em percentual |
| `trend_signal` | Sinal de tendência (NEUTRAL, etc.) |

### Dashboard Avançado - `bquxjob_258b8606_19abcb83c97.csv`

O arquivo CSV (`bquxjob_258b8606_19abcb83c97.csv`) contém todas as colunas do arquivo básico, mais:

| Coluna Adicional | Descrição |
|------------------|-----------|
| `asset_name` | Nome completo do ativo (ex: "Bitcoin", "Apple Inc.") |
| `roc_14d_pct` | Rate of Change de 14 dias em percentual (métrica de momentum) |
| `volume_ratio` | Razão de volume de negociação (indica atividade de mercado) |

**Nota**: Este arquivo contém aproximadamente 8495 registros históricos, oferecendo uma base de dados muito mais extensa para análises temporais e estatísticas avançadas.

## 🔧 Funcionalidades Técnicas

### Carregamento de Dados
- Parsing inteligente do CSV considerando aspas e vírgulas
- Tratamento de valores NULL
- Validação e limpeza de dados

### Filtros Dinâmicos
- Filtros combinados (múltiplos filtros simultâneos)
- Atualização em tempo real dos gráficos e tabelas
- Busca textual na tabela

### Formatação
- Valores monetários formatados em Real (R$)
- Percentuais formatados com 2 casas decimais
- Datas formatadas no padrão brasileiro
- Tratamento especial para valores muito pequenos (criptomoedas)

### Responsividade
- Design adaptável para desktop, tablet e mobile
- Gráficos responsivos
- Tabela com scroll horizontal em telas pequenas

## 🎯 Como Funciona

1. **Carregamento Inicial**: O JavaScript carrega o arquivo CSV via `fetch()`
2. **Parsing**: Os dados são parseados linha por linha, tratando aspas e vírgulas
3. **Processamento**: Dados são convertidos para objetos JavaScript com tipos apropriados
4. **Renderização**: Gráficos são criados usando Chart.js e a tabela é populada
5. **Interatividade**: Filtros e buscas atualizam os dados exibidos em tempo real

## 📱 Compatibilidade

- ✅ Chrome/Edge (últimas versões)
- ✅ Firefox (últimas versões)
- ✅ Safari (últimas versões)
- ✅ Navegadores móveis modernos

## 🤝 Contribuindo

Sinta-se à vontade para fazer fork, criar branches e enviar pull requests!

## 📝 Licença

Este projeto é de código aberto e está disponível para uso livre.

## 👨‍💻 Autor

Desenvolvido para análise de dados financeiros.

---

## 📝 Notas Importantes

- Certifique-se de que os arquivos CSV (`view_gold.csv` e `bquxjob_258b8606_19abcb83c97.csv`) estão no mesmo diretório dos arquivos HTML, CSS e JS para que os dashboards funcionem corretamente.
- O Dashboard Avançado processa um volume maior de dados (8495 registros), então pode levar alguns segundos para carregar completamente.
- Ambos os dashboards são totalmente responsivos e funcionam em dispositivos móveis, tablets e desktops.

