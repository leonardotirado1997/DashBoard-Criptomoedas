let allData = [];
let filteredData = [];
let charts = {};

// Carregar dados do CSV
async function loadData() {
    try {
        const response = await fetch('view_gold.csv');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        allData = lines.slice(1).map(line => {
            const values = parseCSVLine(line);
            return {
                market_type: values[0],
                asset_symbol: values[1],
                ref_date: values[2],
                close_price: parseFloat(values[3]) || 0,
                daily_return_pct: values[4] === 'NULL' ? null : parseFloat(values[4]) || 0,
                sma_7d: parseFloat(values[5]) || 0,
                sma_21d: parseFloat(values[6]) || 0,
                volatility_7d: parseFloat(values[7]) || 0,
                drawdown_pct: parseFloat(values[8]) || 0,
                trend_signal: values[9]
            };
        }).filter(row => row.asset_symbol);
        
        filteredData = [...allData];
        initializeFilters();
        updateDashboard();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar o arquivo CSV. Certifique-se de que o arquivo está no mesmo diretório.');
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
            row.asset_symbol.toLowerCase().includes(searchTerm)
        );
    }
    
    updateStats(displayData);
    updateCharts(displayData);
    updateTable(displayData);
}

// Atualizar estatísticas
function updateStats(data) {
    const totalAssets = new Set(data.map(d => d.asset_symbol)).size;
    const prices = data.map(d => d.close_price).filter(p => p > 0);
    const returns = data.map(d => d.daily_return_pct).filter(r => r !== null);
    const volatilities = data.map(d => d.volatility_7d).filter(v => v > 0);
    
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const avgVolatility = volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 0;
    
    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
    document.getElementById('avgReturn').textContent = formatPercent(avgReturn);
    document.getElementById('avgVolatility').textContent = avgVolatility.toFixed(4);
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
            row.asset_symbol.toLowerCase().includes(searchTerm)
        );
    }
    
    tbody.innerHTML = '';
    
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge badge-${row.market_type.toLowerCase()}">${row.market_type}</span></td>
            <td><strong>${row.asset_symbol}</strong></td>
            <td>${formatDate(row.ref_date)}</td>
            <td>${formatCurrency(row.close_price)}</td>
            <td class="${row.daily_return_pct !== null ? (row.daily_return_pct >= 0 ? 'positive' : 'negative') : 'neutral'}">
                ${row.daily_return_pct !== null ? formatPercent(row.daily_return_pct) : 'N/A'}
            </td>
            <td>${formatCurrency(row.sma_7d)}</td>
            <td>${formatCurrency(row.sma_21d)}</td>
            <td>${row.volatility_7d.toFixed(4)}</td>
            <td class="${row.drawdown_pct >= 0 ? 'positive' : 'negative'}">
                ${formatPercent(row.drawdown_pct)}
            </td>
            <td><span class="badge badge-neutral">${row.trend_signal}</span></td>
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
    if (value >= 1000) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }
    return new Intl.NumberFormat('pt-BR', {
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Carregar dados ao iniciar
loadData();

