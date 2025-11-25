let allData = [];
let filteredData = [];
let charts = {};

// Carregar dados do CSV
async function loadData() {
    try {
        const response = await fetch('view_gold_final.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        allData = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            return {
                market_type: values[0],
                asset_symbol: values[1],
                asset_name: values[2] || values[1],
                ref_date: values[3],
                close_price: parseFloat(values[4]) || 0,
                daily_return_pct: values[5] === 'NULL' || values[5] === '' ? null : parseFloat(values[5]) || null,
                sma_7d: parseFloat(values[6]) || 0,
                sma_21d: parseFloat(values[7]) || 0,
                volatility_7d: parseFloat(values[8]) || 0,
                roc_14d_pct: values[9] === '' || values[9] === 'NULL' ? null : parseFloat(values[9]) || null,
                drawdown_pct: parseFloat(values[10]) || 0,
                volume_ratio: parseFloat(values[11]) || 0,
                trend_signal: values[12] || 'NEUTRAL'
            };
        }).filter(row => row.asset_symbol && row.asset_symbol.trim() !== '');
        
        filteredData = [...allData];
        initializeFilters();
        updateDashboard();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar o arquivo CSV. Certifique-se de que o arquivo view_gold_final.csv está no mesmo diretório.');
    }
}

// Função para parsear CSV considerando aspas
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Inicializar filtros
function initializeFilters() {
    const assetFilter = document.getElementById('assetFilter');
    const assets = [...new Set(allData.map(d => d.asset_symbol))].sort();
    
    assets.forEach(asset => {
        const option = document.createElement('option');
        option.value = asset;
        option.textContent = asset;
        assetFilter.appendChild(option);
    });
    
    // Event listeners
    document.getElementById('marketFilter').addEventListener('change', applyFilters);
    document.getElementById('assetFilter').addEventListener('change', applyFilters);
    document.getElementById('trendFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applySearch);
}

// Aplicar filtros
function applyFilters() {
    const marketFilter = document.getElementById('marketFilter').value;
    const assetFilter = document.getElementById('assetFilter').value;
    const trendFilter = document.getElementById('trendFilter').value;
    
    filteredData = allData.filter(row => {
        const marketMatch = marketFilter === 'all' || row.market_type === marketFilter;
        const assetMatch = assetFilter === 'all' || row.asset_symbol === assetFilter;
        const trendMatch = trendFilter === 'all' || row.trend_signal === trendFilter;
        return marketMatch && assetMatch && trendMatch;
    });
    
    applySearch();
}

// Aplicar busca
function applySearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let displayData = filteredData;
    
    if (searchTerm) {
        displayData = filteredData.filter(row => 
            row.asset_symbol.toLowerCase().includes(searchTerm) ||
            (row.asset_name && row.asset_name.toLowerCase().includes(searchTerm))
        );
    }
    
    updateStats(displayData);
    updateCharts(displayData);
    updateTable(displayData);
}

// Atualizar estatísticas (10 KPIs)
function updateStats(data) {
    // KPI 1: Total de Ativos Únicos
    const totalAssets = new Set(data.map(d => d.asset_symbol)).size;
    
    // KPI 2: Total de Registros
    const totalRecords = data.length;
    
    // KPI 3: Preço Médio
    const prices = data.map(d => d.close_price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    
    // KPI 4: Retorno Médio Diário
    const returns = data.map(d => d.daily_return_pct).filter(r => r !== null);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    
    // KPI 5: Volatilidade Média (7 dias)
    const volatilities = data.map(d => d.volatility_7d).filter(v => v > 0);
    const avgVolatility = volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 0;
    
    // KPI 6: ROC Médio (14 dias)
    const rocs = data.map(d => d.roc_14d_pct).filter(r => r !== null);
    const avgROC = rocs.length > 0 ? rocs.reduce((a, b) => a + b, 0) / rocs.length : 0;
    
    // KPI 7: Volume Ratio Médio
    const volumeRatios = data.map(d => d.volume_ratio).filter(v => v > 0);
    const avgVolumeRatio = volumeRatios.length > 0 ? volumeRatios.reduce((a, b) => a + b, 0) / volumeRatios.length : 0;
    
    // KPI 8: Drawdown Médio
    const drawdowns = data.map(d => d.drawdown_pct).filter(d => d !== 0);
    const avgDrawdown = drawdowns.length > 0 ? drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length : 0;
    
    // Atualizar elementos no DOM
    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('totalRecords').textContent = totalRecords.toLocaleString('pt-BR');
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
    document.getElementById('avgReturn').textContent = formatPercent(avgReturn);
    document.getElementById('avgVolatility').textContent = avgVolatility.toFixed(4);
    document.getElementById('avgROC').textContent = formatPercent(avgROC);
    document.getElementById('avgVolumeRatio').textContent = avgVolumeRatio.toFixed(2);
    document.getElementById('avgDrawdown').textContent = formatPercent(avgDrawdown);
}

// Atualizar gráficos
function updateCharts(data) {
    updateMarketChart(data);
    updatePriceChart(data);
    updateReturnChart(data);
    updateVolatilityChart(data);
}

// Gráfico de distribuição por mercado
function updateMarketChart(data) {
    const marketCounts = {};
    data.forEach(row => {
        marketCounts[row.market_type] = (marketCounts[row.market_type] || 0) + 1;
    });
    
    const ctx = document.getElementById('marketChart').getContext('2d');
    
    if (charts.marketChart) {
        charts.marketChart.destroy();
    }
    
    charts.marketChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(marketCounts),
            datasets: [{
                data: Object.values(marketCounts),
                backgroundColor: ['#667eea', '#f59e0b'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Gráfico de top 10 preços
function updatePriceChart(data) {
    const assetPrices = {};
    data.forEach(row => {
        if (!assetPrices[row.asset_symbol] || row.close_price > assetPrices[row.asset_symbol]) {
            assetPrices[row.asset_symbol] = row.close_price;
        }
    });
    
    const sorted = Object.entries(assetPrices)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    if (charts.priceChart) {
        charts.priceChart.destroy();
    }
    
    charts.priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([symbol]) => symbol),
            datasets: [{
                label: 'Preço de Fechamento',
                data: sorted.map(([, price]) => price),
                backgroundColor: '#667eea',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfico de retorno diário
function updateReturnChart(data) {
    const returns = data
        .filter(row => row.daily_return_pct !== null)
        .map(row => row.daily_return_pct)
        .slice(0, 20);
    
    const ctx = document.getElementById('returnChart').getContext('2d');
    
    if (charts.returnChart) {
        charts.returnChart.destroy();
    }
    
    charts.returnChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: returns.map((_, i) => `Registro ${i + 1}`),
            datasets: [{
                label: 'Retorno Diário (%)',
                data: returns,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Gráfico de volatilidade
function updateVolatilityChart(data) {
    const volatilities = data
        .filter(row => row.volatility_7d > 0)
        .map(row => row.volatility_7d)
        .slice(0, 20);
    
    const ctx = document.getElementById('volatilityChart').getContext('2d');
    
    if (charts.volatilityChart) {
        charts.volatilityChart.destroy();
    }
    
    charts.volatilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: volatilities.map((_, i) => `Registro ${i + 1}`),
            datasets: [{
                label: 'Volatilidade 7d',
                data: volatilities,
                backgroundColor: '#f59e0b',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Atualizar tabela
function updateTable(data) {
    const tbody = document.getElementById('tableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let displayData = data;
    
    if (searchTerm) {
        displayData = data.filter(row => 
            row.asset_symbol.toLowerCase().includes(searchTerm) ||
            (row.asset_name && row.asset_name.toLowerCase().includes(searchTerm))
        );
    }
    
    tbody.innerHTML = '';
    
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge badge-${row.market_type.toLowerCase()}">${row.market_type}</span></td>
            <td><strong>${row.asset_symbol}</strong></td>
            <td>${row.asset_name || row.asset_symbol}</td>
            <td>${formatDate(row.ref_date)}</td>
            <td>${formatCurrency(row.close_price)}</td>
            <td class="${row.daily_return_pct !== null ? (row.daily_return_pct >= 0 ? 'positive' : 'negative') : 'neutral'}">
                ${row.daily_return_pct !== null ? formatPercent(row.daily_return_pct) : 'N/A'}
            </td>
            <td class="${row.roc_14d_pct !== null ? (row.roc_14d_pct >= 0 ? 'positive' : 'negative') : 'neutral'}">
                ${row.roc_14d_pct !== null ? formatPercent(row.roc_14d_pct) : 'N/A'}
            </td>
            <td>${formatCurrency(row.sma_7d)}</td>
            <td>${formatCurrency(row.sma_21d)}</td>
            <td>${row.volatility_7d.toFixed(4)}</td>
            <td>${row.volume_ratio.toFixed(2)}</td>
            <td class="${row.drawdown_pct >= 0 ? 'positive' : 'negative'}">
                ${formatPercent(row.drawdown_pct)}
            </td>
            <td><span class="badge badge-${getTrendBadgeClass(row.trend_signal)}">${row.trend_signal}</span></td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('tableInfo').textContent = `Mostrando ${displayData.length} de ${data.length} registros`;
}

// Atualizar dashboard completo
function updateDashboard() {
    updateStats(filteredData);
    updateCharts(filteredData);
    updateTable(filteredData);
}

// Funções de formatação
function formatCurrency(value) {
    if (!value || isNaN(value) || value === 0) {
        return 'R$ 0,00';
    }
    
    // Para valores muito grandes, usar formato mais compacto
    if (value >= 1000000) {
        const millions = value / 1000000;
        return 'R$ ' + millions.toFixed(2).replace('.', ',') + 'M';
    }
    
    if (value >= 1000) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
    }).format(value);
}

function formatPercent(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (e) {
        return dateString;
    }
}

// Função auxiliar para classe de badge de tendência
function getTrendBadgeClass(trend) {
    if (trend === 'UPTREND') return 'uptrend';
    if (trend === 'DOWNTREND') return 'downtrend';
    return 'neutral';
}

// Carregar dados ao iniciar
loadData();

