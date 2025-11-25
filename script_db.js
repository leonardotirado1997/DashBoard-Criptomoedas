let allData = [];
let filteredData = [];
let charts = {};

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
                daily_return_pct: values[5] === 'NULL' || values[5] === '' ? null : parseFloat(values[5]) || 0,
                sma_7d: parseFloat(values[6]) || 0,
                sma_21d: parseFloat(values[7]) || 0,
                volatility_7d: parseFloat(values[8]) || 0,
                roc_14d_pct: values[9] === '' || values[9] === 'NULL' ? null : parseFloat(values[9]) || null,
                drawdown_pct: parseFloat(values[10]) || 0,
                volume_ratio: parseFloat(values[11]) || 0,
                trend_signal: values[12] || 'NEUTRAL'
            };
        }).filter(row => row.asset_symbol && row.asset_symbol.trim() !== '');
        
        // Ordenar por data (mais recente primeiro)
        allData.sort((a, b) => new Date(b.ref_date) - new Date(a.ref_date));
        
        filteredData = [...allData];
        initializeFilters();
        updateDashboard();
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
    
    // Event listeners
    document.getElementById('marketFilter').addEventListener('change', applyFilters);
    document.getElementById('assetFilter').addEventListener('change', applyFilters);
    document.getElementById('trendFilter').addEventListener('change', applyFilters);
    document.getElementById('dateRangeFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', applySearch);
}

// Aplicar filtros
function applyFilters() {
    const marketFilter = document.getElementById('marketFilter').value;
    const assetFilter = document.getElementById('assetFilter').value;
    const trendFilter = document.getElementById('trendFilter').value;
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
        const trendMatch = trendFilter === 'all' || row.trend_signal === trendFilter;
        
        let dateMatch = true;
        if (dateLimit) {
            const rowDate = new Date(row.ref_date);
            dateMatch = rowDate >= dateLimit;
        }
        
        return marketMatch && assetMatch && trendMatch && dateMatch;
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
    updateInsights(displayData);
}

// Atualizar estatísticas
function updateStats(data) {
    const totalRecords = data.length;
    const uniqueAssets = new Set(data.map(d => d.asset_symbol)).filter(s => s)).size;
    
    const rocs = data.map(d => d.roc_14d_pct).filter(r => r !== null && !isNaN(r));
    const avgROC = rocs.length > 0 ? rocs.reduce((a, b) => a + b, 0) / rocs.length : 0;
    
    const volumeRatios = data.map(d => d.volume_ratio).filter(v => v > 0);
    const avgVolumeRatio = volumeRatios.length > 0 ? volumeRatios.reduce((a, b) => a + b, 0) / volumeRatios.length : 0;
    
    document.getElementById('totalRecords').textContent = totalRecords.toLocaleString('pt-BR');
    document.getElementById('uniqueAssets').textContent = uniqueAssets;
    document.getElementById('avgROC').textContent = formatPercent(avgROC);
    document.getElementById('avgVolumeRatio').textContent = avgVolumeRatio.toFixed(2);
}

// Atualizar gráficos
function updateCharts(data) {
    updateTimeSeriesChart(data);
    updateROCDistributionChart(data);
    updateVolumeRatioChart(data);
    updateTopROCChart(data);
    updateCorrelationChart(data);
    updateTrendDistributionChart(data);
}

// Gráfico de série temporal
function updateTimeSeriesChart(data) {
    // Agrupar por data e calcular preço médio
    const dateGroups = {};
    data.forEach(row => {
        const date = row.ref_date.split('T')[0];
        if (!dateGroups[date]) {
            dateGroups[date] = [];
        }
        dateGroups[date].push(row.close_price);
    });
    
    const dates = Object.keys(dateGroups).sort();
    const avgPrices = dates.map(date => {
        const prices = dateGroups[date];
        return prices.reduce((a, b) => a + b, 0) / prices.length;
    });
    
    const ctx = document.getElementById('timeSeriesChart').getContext('2d');
    
    if (charts.timeSeriesChart) {
        charts.timeSeriesChart.destroy();
    }
    
    charts.timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Preço Médio',
                data: avgPrices,
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
                    display: true
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
                    beginAtZero: false
                }
            }
        }
    });
}

// Gráfico de distribuição de ROC
function updateROCDistributionChart(data) {
    const rocs = data.map(d => d.roc_14d_pct).filter(r => r !== null && !isNaN(r));
    
    // Criar bins para histograma
    const bins = {
        'Muito Negativo (<-10%)': 0,
        'Negativo (-10% a -5%)': 0,
        'Levemente Negativo (-5% a 0%)': 0,
        'Levemente Positivo (0% a 5%)': 0,
        'Positivo (5% a 10%)': 0,
        'Muito Positivo (>10%)': 0
    };
    
    rocs.forEach(roc => {
        if (roc < -10) bins['Muito Negativo (<-10%)']++;
        else if (roc < -5) bins['Negativo (-10% a -5%)']++;
        else if (roc < 0) bins['Levemente Negativo (-5% a 0%)']++;
        else if (roc < 5) bins['Levemente Positivo (0% a 5%)']++;
        else if (roc < 10) bins['Positivo (5% a 10%)']++;
        else bins['Muito Positivo (>10%)']++;
    });
    
    const ctx = document.getElementById('rocDistributionChart').getContext('2d');
    
    if (charts.rocDistributionChart) {
        charts.rocDistributionChart.destroy();
    }
    
    charts.rocDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(bins),
            datasets: [{
                label: 'Frequência',
                data: Object.values(bins),
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#fbbf24',
                    '#84cc16',
                    '#10b981',
                    '#059669'
                ],
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

// Gráfico de volume ratio
function updateVolumeRatioChart(data) {
    const assetVolumeRatios = {};
    data.forEach(row => {
        if (!assetVolumeRatios[row.asset_symbol]) {
            assetVolumeRatios[row.asset_symbol] = [];
        }
        if (row.volume_ratio > 0) {
            assetVolumeRatios[row.asset_symbol].push(row.volume_ratio);
        }
    });
    
    const avgRatios = Object.entries(assetVolumeRatios)
        .map(([symbol, ratios]) => ({
            symbol,
            avgRatio: ratios.reduce((a, b) => a + b, 0) / ratios.length
        }))
        .sort((a, b) => b.avgRatio - a.avgRatio)
        .slice(0, 15);
    
    const ctx = document.getElementById('volumeRatioChart').getContext('2d');
    
    if (charts.volumeRatioChart) {
        charts.volumeRatioChart.destroy();
    }
    
    charts.volumeRatioChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: avgRatios.map(r => r.symbol),
            datasets: [{
                label: 'Volume Ratio Médio',
                data: avgRatios.map(r => r.avgRatio),
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

// Gráfico de top ROC
function updateTopROCChart(data) {
    const assetROCs = {};
    data.forEach(row => {
        if (row.roc_14d_pct !== null && !isNaN(row.roc_14d_pct)) {
            if (!assetROCs[row.asset_symbol]) {
                assetROCs[row.asset_symbol] = [];
            }
            assetROCs[row.asset_symbol].push(row.roc_14d_pct);
        }
    });
    
    const avgROCs = Object.entries(assetROCs)
        .map(([symbol, rocs]) => ({
            symbol,
            avgROC: rocs.reduce((a, b) => a + b, 0) / rocs.length
        }))
        .sort((a, b) => b.avgROC - a.avgROC)
        .slice(0, 10);
    
    const ctx = document.getElementById('topROChart').getContext('2d');
    
    if (charts.topROChart) {
        charts.topROChart.destroy();
    }
    
    charts.topROChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: avgROCs.map(r => r.symbol),
            datasets: [{
                label: 'ROC 14d Médio (%)',
                data: avgROCs.map(r => r.avgROC),
                backgroundColor: avgROCs.map(r => r.avgROC >= 0 ? '#10b981' : '#ef4444'),
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
                    beginAtZero: false
                }
            }
        }
    });
}

// Gráfico de correlação
function updateCorrelationChart(data) {
    const points = data
        .filter(row => row.volatility_7d > 0 && row.volume_ratio > 0)
        .slice(0, 500); // Limitar para performance
    
    const ctx = document.getElementById('correlationChart').getContext('2d');
    
    if (charts.correlationChart) {
        charts.correlationChart.destroy();
    }
    
    charts.correlationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Volatilidade vs Volume Ratio',
                data: points.map(row => ({
                    x: row.volatility_7d,
                    y: row.volume_ratio
                })),
                backgroundColor: 'rgba(102, 126, 234, 0.5)',
                borderColor: '#667eea',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Volatilidade 7d'
                    },
                    beginAtZero: true
                },
                y: {
                    title: {
                        display: true,
                        text: 'Volume Ratio'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Gráfico de distribuição de tendências
function updateTrendDistributionChart(data) {
    const trendCounts = {};
    data.forEach(row => {
        trendCounts[row.trend_signal] = (trendCounts[row.trend_signal] || 0) + 1;
    });
    
    const ctx = document.getElementById('trendDistributionChart').getContext('2d');
    
    if (charts.trendDistributionChart) {
        charts.trendDistributionChart.destroy();
    }
    
    charts.trendDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(trendCounts),
            datasets: [{
                data: Object.values(trendCounts),
                backgroundColor: [
                    '#667eea',
                    '#10b981',
                    '#ef4444',
                    '#6b7280'
                ],
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
    
    // Limitar a 1000 registros para performance
    displayData = displayData.slice(0, 1000);
    
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
            <td>${row.volume_ratio.toFixed(2)}</td>
            <td>${row.volatility_7d.toFixed(4)}</td>
            <td class="${row.drawdown_pct >= 0 ? 'positive' : 'negative'}">
                ${formatPercent(row.drawdown_pct)}
            </td>
            <td><span class="badge badge-${getTrendBadgeClass(row.trend_signal)}">${row.trend_signal}</span></td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('tableInfo').textContent = `Mostrando ${displayData.length} de ${data.length} registros`;
}

// Atualizar insights
function updateInsights(data) {
    const container = document.getElementById('insightsContainer');
    container.innerHTML = '';
    
    // Calcular insights
    const totalRecords = data.length;
    const uniqueAssets = new Set(data.map(d => d.asset_symbol).filter(s => s)).size;
    
    const rocs = data.map(d => d.roc_14d_pct).filter(r => r !== null && !isNaN(r));
    const positiveROCs = rocs.filter(r => r > 0).length;
    const negativeROCs = rocs.filter(r => r < 0).length;
    
    const trends = {};
    data.forEach(row => {
        trends[row.trend_signal] = (trends[row.trend_signal] || 0) + 1;
    });
    
    const uptrendCount = trends['UPTREND'] || 0;
    const downtrendCount = trends['DOWNTREND'] || 0;
    const neutralCount = trends['NEUTRAL'] || 0;
    
    const volumeRatios = data.map(d => d.volume_ratio).filter(v => v > 0);
    const highVolumeRatio = volumeRatios.filter(v => v > 1.0).length;
    
    const insights = [
        {
            title: 'Análise de Registros',
            content: `Total de ${totalRecords.toLocaleString('pt-BR')} registros analisados de ${uniqueAssets} ativos únicos.`,
            icon: '📊'
        },
        {
            title: 'Análise de ROC',
            content: `${positiveROCs} registros com ROC positivo (${((positiveROCs/rocs.length)*100).toFixed(1)}%) vs ${negativeROCs} negativos (${((negativeROCs/rocs.length)*100).toFixed(1)}%).`,
            icon: '📈'
        },
        {
            title: 'Distribuição de Tendências',
            content: `${uptrendCount} em alta, ${downtrendCount} em baixa, ${neutralCount} neutros.`,
            icon: '🎯'
        },
        {
            title: 'Volume Trading',
            content: `${highVolumeRatio} registros com volume ratio acima de 1.0, indicando maior atividade de negociação.`,
            icon: '💹'
        }
    ];
    
    insights.forEach(insight => {
        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h3>${insight.title}</h3>
                <p>${insight.content}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Função auxiliar para classe de badge de tendência
function getTrendBadgeClass(trend) {
    if (trend === 'UPTREND') return 'uptrend';
    if (trend === 'DOWNTREND') return 'downtrend';
    return 'neutral';
}

// Atualizar dashboard completo
function updateDashboard() {
    updateStats(filteredData);
    updateCharts(filteredData);
    updateTable(filteredData);
    updateInsights(filteredData);
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

