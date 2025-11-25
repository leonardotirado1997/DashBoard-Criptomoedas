# 📊 Dashboard Financeiro - Análise de Ativos

Dashboard interativo para análise de dados financeiros de ações e criptomoedas, desenvolvido com HTML, CSS e JavaScript puro.

## 📋 Sobre o Projeto

Este dashboard permite visualizar e analisar dados financeiros de diferentes ativos (ações e criptomoedas) de forma interativa. Os dados são carregados a partir de um arquivo CSV (`view_gold.csv`) e apresentados através de gráficos, estatísticas e tabelas dinâmicas.

## ✨ Funcionalidades

### 🔍 Filtros Interativos
- **Tipo de Mercado**: Filtre por Ações (STOCK) ou Criptomoedas (CRYPTO)
- **Ativo Específico**: Selecione um ativo específico para análise detalhada
- **Sinal de Tendência**: Filtre por sinal de tendência (NEUTRAL, etc.)

### 📈 Estatísticas em Tempo Real
- **Total de Ativos**: Quantidade única de ativos no dataset
- **Preço Médio**: Média dos preços de fechamento
- **Retorno Médio**: Média dos retornos diários em percentual
- **Volatilidade Média**: Média da volatilidade de 7 dias

### 📊 Visualizações Gráficas
1. **Distribuição por Tipo de Mercado**: Gráfico de pizza mostrando a proporção entre ações e criptomoedas
2. **Top 10 Ativos por Preço**: Gráfico de barras com os 10 ativos de maior preço
3. **Retorno Diário**: Gráfico de linha mostrando a evolução dos retornos
4. **Volatilidade 7 Dias**: Gráfico de barras com a volatilidade dos ativos

### 📋 Tabela de Dados
- Tabela completa com todos os dados do CSV
- Busca por símbolo do ativo
- Formatação automática de valores monetários e percentuais
- Cores indicativas para valores positivos (verde) e negativos (vermelho)
- Informação sobre quantidade de registros exibidos

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

3. **Acesse o dashboard**
   - Abra seu navegador
   - Acesse: `http://localhost:8000`
   - O dashboard será carregado automaticamente

### ⚠️ Importante
O dashboard precisa ser executado em um servidor web local porque utiliza `fetch()` para carregar o arquivo CSV. Abrir o arquivo HTML diretamente no navegador (file://) não funcionará devido às políticas de segurança do navegador (CORS).

## 📁 Estrutura do Projeto

```
.
├── index.html          # Estrutura HTML do dashboard
├── style.css           # Estilos e design responsivo
├── script.js           # Lógica JavaScript e manipulação de dados
├── view_gold.csv       # Arquivo de dados financeiros
└── README.md          # Este arquivo
```

## 🎨 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica do dashboard
- **CSS3**: Estilização moderna com gradientes e animações
- **JavaScript (ES6+)**: Lógica de manipulação de dados e interatividade
- **Chart.js**: Biblioteca para criação de gráficos interativos

## 📊 Estrutura dos Dados

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

**Nota**: Certifique-se de que o arquivo `view_gold.csv` está no mesmo diretório dos arquivos HTML, CSS e JS para que o dashboard funcione corretamente.

