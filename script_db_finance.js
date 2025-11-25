let allData = [];
let filteredData = [];
let charts = {};

// Cores para os gráficos
const colors = {
    stock: '#14b8a6',      // Teal para ações
    crypto: '#60a5fa',      // Light blue para cripto
    positive: '#4caf50',
    negative: '#ef4444',
    neutral: '#6b7280'
};

// Carregar dados do CSV
async function loadData() {
    try {
        const response = await fetch('bquxjob_258b8606_19abcb83c97.csv');
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
        
        // Ordenar por data
        allData.sort((a, b) => new Date(a.ref_date) - new Date(b.ref_date));
        
        filteredData = [...allData];
        
        // Inicializar filtros
        initializeFilters();
        updateDashboard();
        updateCurrentDate();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar o arquivo CSV. Certifique-se de que o arquivo bquxjob_258b8606_19abcb83c97.csv está no mesmo diretório.');
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
    
    // Event listeners para filtros
    document.getElementById('marketTypeFilter').addEventListener('change', applyFilters);
    document.getElementById('assetFilter').addEventListener('change', applyFilters);
    document.getElementById('dateRangeFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applySearch);
}

// Aplicar filtros
function applyFilters() {
    const marketFilter = document.getElementById('marketTypeFilter').value;
    const assetFilter = document.getElementById('assetFilter').value;
    const dateRangeFilter = document.getElementById('dateRangeFilter').value;
    
    const now = new Date();
    let dateLimit = null;
    
    if (dateRangeFilter === '7d') {
        dateLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRangeFilter === '30d') {
        dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRangeFilter === '90d') {
        dateLimit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
    
    filteredData = allData.filter(row => {
        const marketMatch = marketFilter === 'all' || row.market_type === marketFilter;
        const assetMatch = assetFilter === 'all' || row.asset_symbol === assetFilter;
        
        let dateMatch = true;
        if (dateLimit) {
            const rowDate = new Date(row.ref_date);
            dateMatch = rowDate >= dateLimit;
        }
        
        return marketMatch && assetMatch && dateMatch;
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
    
    updateDashboard();
    updateTable(displayData);
}

// Atualizar dashboard completo
function updateDashboard() {
    updateStats(); // KPIs do index.html (Total de Ativos, Preço Médio, Retorno Médio, Volatilidade Média)
    updateMetrics(); // Métricas adicionais
    updateAlocacaoChart();
    updateMarketTypeChart();
    updateMarketChart(filteredData); // Gráfico do index.html
    updatePriceChart(filteredData); // Gráfico do index.html
    updateReturnChart(filteredData); // Gráfico do index.html
    updateVolatility7dChart(filteredData); // Gráfico do index.html
    updateTimeSeriesChart();
    updateTopAtivosChart();
    updateVolatilityChart();
    updateTable(filteredData);
}

// Atualizar KPIs do index.html (calculados exatamente como no index.html)
function updateStats() {
    // Total de Ativos - quantidade única de ativos
    const totalAssets = new Set(filteredData.map(d => d.asset_symbol)).size;
    
    // Preço Médio - média dos preços de fechamento
    const prices = filteredData.map(d => d.close_price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    
    // Retorno Médio - média dos retornos diários
    const returns = filteredData.map(d => d.daily_return_pct).filter(r => r !== null);
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    
    // Volatilidade Média - média da volatilidade de 7 dias
    const volatilities = filteredData.map(d => d.volatility_7d).filter(v => v > 0);
    const avgVolatility = volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 0;
    
    // Atualizar elementos na sidebar
    document.getElementById('totalAssets').textContent = totalAssets;
    document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
    document.getElementById('avgReturn').textContent = formatPercent(avgReturn);
    document.getElementById('avgVolatility').textContent = avgVolatility.toFixed(4);
}

// Atualizar métricas técnicas adicionais
function updateMetrics() {
    const totalRegistros = filteredData.length;
    const ativosUnicos = new Set(filteredData.map(d => d.asset_symbol).filter(s => s)).size;
    
    const rocs = filteredData.map(d => d.roc_14d_pct).filter(r => r !== null);
    const rocMedio = rocs.length > 0 ? rocs.reduce((a, b) => a + b, 0) / rocs.length : 0;
    
    const volumeRatios = filteredData.map(d => d.volume_ratio).filter(v => v > 0);
    const volumeRatioMedio = volumeRatios.length > 0 ? volumeRatios.reduce((a, b) => a + b, 0) / volumeRatios.length : 0;
    
    const drawdowns = filteredData.map(d => d.drawdown_pct).filter(d => d !== 0);
    const drawdownMedio = drawdowns.length > 0 ? drawdowns.reduce((a, b) => a + b, 0) / drawdowns.length : 0;
    
    document.getElementById('totalRegistros').textContent = totalRegistros.toLocaleString('pt-BR');
    document.getElementById('ativosUnicos').textContent = ativosUnicos;
    
    document.getElementById('rocMedio').textContent = formatPercent(rocMedio);
    document.getElementById('rocMedioPercent').textContent = formatPercent(rocMedio);
    document.getElementById('rocMedioPercent').className = 'patrimonio-percent ' + (rocMedio >= 0 ? 'positive' : 'negative');
    
    document.getElementById('volumeRatioMedio').textContent = volumeRatioMedio.toFixed(2);
    document.getElementById('drawdownMedio').textContent = formatPercent(drawdownMedio);
    document.getElementById('drawdownMedio').className = 'resumo-value ' + (drawdownMedio >= 0 ? 'positive' : 'negative');
}

// Atualizar gráfico de alocação (Ações vs Cripto)
function updateAlocacaoChart() {
    const acoes = filteredData.filter(d => d.market_type === 'STOCK');
    const cripto = filteredData.filter(d => d.market_type === 'CRYPTO');
    
    const acoesCount = acoes.length;
    const criptoCount = cripto.length;
    const total = acoesCount + criptoCount;
    
    const ctx = document.getElementById('alocacaoChart').getContext('2d');
    
    if (charts.alocacaoChart) {
        charts.alocacaoChart.destroy();
    }
    
    charts.alocacaoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ações', 'Criptomoedas'],
            datasets: [{
                data: [acoesCount, criptoCount],
                backgroundColor: [colors.stock, colors.crypto],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Criar legenda
    const legendContainer = document.getElementById('alocacaoLegend');
    legendContainer.innerHTML = '';
    
    const items = [
        { label: 'Ações', value: acoesCount, percent: total > 0 ? ((acoesCount / total) * 100).toFixed(1) : 0, color: colors.stock },
        { label: 'Criptomoedas', value: criptoCount, percent: total > 0 ? ((criptoCount / total) * 100).toFixed(1) : 0, color: colors.crypto }
    ];
    
    items.forEach(item => {
        if (item.value > 0) {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <div class="legend-label">${item.label}</div>
                <div class="legend-value">${item.percent}%</div>
            `;
            legendContainer.appendChild(legendItem);
        }
    });
}

// Atualizar gráfico de distribuição Ações vs Cripto (pizza)
function updateMarketTypeChart() {
    const acoes = filteredData.filter(d => d.market_type === 'STOCK');
    const cripto = filteredData.filter(d => d.market_type === 'CRYPTO');
    
    const acoesCount = acoes.length;
    const criptoCount = cripto.length;
    
    const ctx = document.getElementById('marketTypeChart').getContext('2d');
    
    if (charts.marketTypeChart) {
        charts.marketTypeChart.destroy();
    }
    
    charts.marketTypeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Ações', 'Criptomoedas'],
            datasets: [{
                data: [acoesCount, criptoCount],
                backgroundColor: [colors.stock, colors.crypto],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return {
                                        text: `${label} (${percent}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        strokeStyle: data.datasets[0].borderColor,
                                        lineWidth: data.datasets[0].borderWidth,
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                }
            }
        }
    });
}

// Atualizar gráfico de série temporal
function updateTimeSeriesChart() {
    // Agrupar por data e calcular preço médio por tipo
    const dateGroups = {};
    
    filteredData.forEach(row => {
        const date = row.ref_date.split('T')[0];
        if (!dateGroups[date]) {
            dateGroups[date] = { stock: [], crypto: [] };
        }
        if (row.market_type === 'STOCK') {
            dateGroups[date].stock.push(row.close_price);
        } else if (row.market_type === 'CRYPTO') {
            dateGroups[date].crypto.push(row.close_price);
        }
    });
    
    const dates = Object.keys(dateGroups).sort();
    const stockPrices = dates.map(date => {
        const prices = dateGroups[date].stock;
        return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    });
    const cryptoPrices = dates.map(date => {
        const prices = dateGroups[date].crypto;
        return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    });
    
    const ctx = document.getElementById('timeSeriesChart').getContext('2d');
    
    if (charts.timeSeriesChart) {
        charts.timeSeriesChart.destroy();
    }
    
    charts.timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Ações - Preço Médio',
                    data: stockPrices,
                    borderColor: colors.stock,
                    backgroundColor: colors.stock + '20',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Criptomoedas - Preço Médio',
                    data: cryptoPrices,
                    borderColor: colors.crypto,
                    backgroundColor: colors.crypto + '20',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Atualizar gráfico de top ativos
function updateTopAtivosChart() {
    // Agrupar por ativo e pegar o preço mais recente
    const assetMap = new Map();
    
    filteredData.forEach(row => {
        if (!assetMap.has(row.asset_symbol) || 
            new Date(row.ref_date) > new Date(assetMap.get(row.asset_symbol).ref_date)) {
            assetMap.set(row.asset_symbol, row);
        }
    });
    
    const topAtivos = Array.from(assetMap.values())
        .map(asset => ({
            symbol: asset.asset_symbol,
            name: asset.asset_name,
            price: asset.close_price,
            type: asset.market_type
        }))
        .sort((a, b) => b.price - a.price)
        .slice(0, 20);
    
    const ctx = document.getElementById('topAtivosChart').getContext('2d');
    
    if (charts.topAtivosChart) {
        charts.topAtivosChart.destroy();
    }
    
    charts.topAtivosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topAtivos.map(a => a.symbol),
            datasets: [{
                label: 'Preço de Fechamento',
                data: topAtivos.map(a => a.price),
                backgroundColor: topAtivos.map(a => a.type === 'STOCK' ? colors.stock : colors.crypto),
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.parsed.x);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de distribuição por mercado (do index.html)
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
                backgroundColor: [colors.stock, colors.crypto],
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

// Gráfico de top 10 preços (do index.html)
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
                backgroundColor: colors.stock,
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
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de retorno diário (do index.html)
function updateReturnChart(data) {
    const returns = data
        .filter(row => row.daily_return_pct !== null)
        .map(row => row.daily_return_pct)
        .slice(-20); // Últimos 20 registros
    
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
                borderColor: colors.stock,
                backgroundColor: colors.stock + '20',
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
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Gráfico de volatilidade 7 dias (do index.html)
function updateVolatility7dChart(data) {
    const volatilities = data
        .filter(row => row.volatility_7d > 0)
        .map(row => row.volatility_7d)
        .slice(-20); // Últimos 20 registros
    
    const ctx = document.getElementById('volatility7dChart').getContext('2d');
    
    if (charts.volatility7dChart) {
        charts.volatility7dChart.destroy();
    }
    
    charts.volatility7dChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: volatilities.map((_, i) => `Registro ${i + 1}`),
            datasets: [{
                label: 'Volatilidade 7d',
                data: volatilities,
                backgroundColor: colors.crypto,
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

// Atualizar gráfico de volatilidade
function updateVolatilityChart() {
    // Agrupar por data e calcular volatilidade média
    const dateGroups = {};
    
    filteredData.forEach(row => {
        const date = row.ref_date.split('T')[0];
        if (!dateGroups[date]) {
            dateGroups[date] = [];
        }
        if (row.volatility_7d > 0) {
            dateGroups[date].push(row.volatility_7d);
        }
    });
    
    const dates = Object.keys(dateGroups).sort().slice(-30); // Últimos 30 dias
    const avgVolatilities = dates.map(date => {
        const volatilities = dateGroups[date];
        return volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 0;
    });
    
    const ctx = document.getElementById('volatilityChart').getContext('2d');
    
    if (charts.volatilityChart) {
        charts.volatilityChart.destroy();
    }
    
    charts.volatilityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Volatilidade Média (7 dias)',
                data: avgVolatilities,
                borderColor: colors.stock,
                backgroundColor: colors.stock + '20',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Atualizar tabela
function updateTable(data) {
    const tbody = document.getElementById('carteiraTableBody');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    let displayData = data;
    
    if (searchTerm) {
        displayData = data.filter(row => 
            row.asset_symbol.toLowerCase().includes(searchTerm) ||
            (row.asset_name && row.asset_name.toLowerCase().includes(searchTerm))
        );
    }
    
    // Limitar a 1000 registros para performance
    displayData = displayData.slice(-1000).reverse(); // Mostrar mais recentes primeiro
    
    tbody.innerHTML = '';
    
    displayData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDateTime(row.ref_date)}</td>
            <td><span class="badge badge-${row.market_type.toLowerCase()}">${row.market_type}</span></td>
            <td><strong>${row.asset_symbol}</strong></td>
            <td>${row.asset_name || row.asset_symbol}</td>
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

// Função auxiliar para classe de badge de tendência
function getTrendBadgeClass(trend) {
    if (trend === 'UPTREND') return 'uptrend';
    if (trend === 'DOWNTREND') return 'downtrend';
    return 'neutral';
}

// Atualizar data atual
function updateCurrentDate() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateStr;
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

function formatDateTime(dateString) {
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

// Carregar dados ao iniciar
loadData();
