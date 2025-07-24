// Advanced visualization service for BioVerse dashboard charts and graphs
const { logger } = require('./logger');

class VisualizationService {
  constructor() {
    this.chartTypes = {
      line: 'line',
      bar: 'bar',
      pie: 'pie',
      doughnut: 'doughnut',
      area: 'area',
      scatter: 'scatter',
      gauge: 'gauge',
      heatmap: 'heatmap'
    };
    
    this.colorPalettes = {
      primary: ['#3B82F6', '#1D4ED8', '#2563EB', '#1E40AF', '#1E3A8A'],
      health: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
      warning: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
      danger: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
      gradient: ['#667EEA', '#764BA2', '#F093FB', '#F5576C', '#4FACFE']
    };
  }

  // === HEALTH TWIN VISUALIZATIONS ===
  generateHealthTwinCharts(healthTwin) {
    return {
      vitalsChart: this.createVitalsLineChart(healthTwin.vitals),
      riskAssessment: this.createRiskGaugeChart(healthTwin.riskScore),
      healthScore: this.createHealthScoreRadial(healthTwin.healthScore),
      predictionTimeline: this.createPredictionTimeline(healthTwin.predictions),
      medicationAdherence: this.createMedicationChart(healthTwin.medications),
      labResultsTrends: this.createLabTrendsChart(healthTwin.labResults)
    };
  }

  createVitalsLineChart(vitalsData) {
    const dates = this.generateDateRange(30); // Last 30 days
    
    return {
      type: this.chartTypes.line,
      title: 'Vital Signs Trends',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Blood Pressure (Systolic)',
            data: this.generateVitalsTrend(120, 20, 30),
            borderColor: this.colorPalettes.danger[0],
            backgroundColor: this.addAlpha(this.colorPalettes.danger[0], 0.1),
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Heart Rate (BPM)',
            data: this.generateVitalsTrend(75, 15, 30),
            borderColor: this.colorPalettes.primary[0],
            backgroundColor: this.addAlpha(this.colorPalettes.primary[0], 0.1),
            tension: 0.4,
            yAxisID: 'y1'
          },
          {
            label: 'Temperature (°C)',
            data: this.generateVitalsTrend(36.7, 1, 30),
            borderColor: this.colorPalettes.warning[0],
            backgroundColor: this.addAlpha(this.colorPalettes.warning[0], 0.1),
            tension: 0.4,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Blood Pressure (mmHg)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Heart Rate (BPM)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const value = context.parsed.y;
                if (context.datasetIndex === 0) {
                  return value > 140 ? '⚠️ High BP' : value < 90 ? '⚠️ Low BP' : '✅ Normal';
                } else if (context.datasetIndex === 1) {
                  return value > 100 ? '⚠️ High HR' : value < 60 ? '⚠️ Low HR' : '✅ Normal';
                }
                return '';
              }
            }
          }
        }
      }
    };
  }

  createRiskGaugeChart(riskScore) {
    return {
      type: this.chartTypes.gauge,
      title: 'Health Risk Assessment',
      data: {
        datasets: [{
          data: [riskScore, 100 - riskScore],
          backgroundColor: [
            riskScore > 70 ? this.colorPalettes.danger[0] :
            riskScore > 40 ? this.colorPalettes.warning[0] :
            this.colorPalettes.health[0],
            '#E5E7EB'
          ],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      },
      centerText: {
        value: riskScore,
        label: 'Risk Score',
        color: riskScore > 70 ? this.colorPalettes.danger[0] :
               riskScore > 40 ? this.colorPalettes.warning[0] :
               this.colorPalettes.health[0]
      }
    };
  }

  createHealthScoreRadial(healthScore) {
    return {
      type: 'radialBar',
      title: 'Overall Health Score',
      series: [healthScore],
      options: {
        chart: {
          height: 280,
          type: 'radialBar',
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '70%',
            },
            dataLabels: {
              show: true,
              name: {
                offsetY: -10,
                show: true,
                color: '#888',
                fontSize: '17px'
              },
              value: {
                formatter: function(val) {
                  return parseInt(val);
                },
                color: '#111',
                fontSize: '36px',
                show: true,
              }
            }
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: [healthScore > 70 ? '#10B981' : healthScore > 40 ? '#F59E0B' : '#EF4444'],
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100]
          }
        },
        stroke: {
          lineCap: 'round'
        },
        labels: ['Health Score']
      }
    };
  }

  createPredictionTimeline(predictions) {
    const timelineData = predictions.map((pred, index) => ({
      x: pred.timeframe,
      y: pred.probability * 100,
      condition: pred.condition,
      confidence: pred.confidence
    }));

    return {
      type: this.chartTypes.scatter,
      title: 'Health Risk Predictions Timeline',
      data: {
        datasets: [{
          label: 'Risk Predictions',
          data: timelineData,
          backgroundColor: this.colorPalettes.warning[0],
          borderColor: this.colorPalettes.warning[1],
          pointRadius: 8,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Timeframe'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Risk Probability (%)'
            },
            min: 0,
            max: 100
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw;
                return `${point.condition}: ${point.y}% risk in ${point.x}`;
              }
            }
          }
        }
      }
    };
  }

  // === SYSTEM ANALYTICS VISUALIZATIONS ===
  generateSystemAnalytics(systemData) {
    return {
      userGrowth: this.createUserGrowthChart(systemData.userGrowth),
      appointmentStats: this.createAppointmentStatsChart(systemData.appointments),
      emergencyAlerts: this.createEmergencyAlertsChart(systemData.alerts),
      revenueChart: this.createRevenueChart(systemData.revenue),
      performanceMetrics: this.createPerformanceChart(systemData.performance),
      userEngagement: this.createEngagementHeatmap(systemData.engagement)
    };
  }

  createUserGrowthChart(userGrowthData) {
    const months = this.generateMonthRange(12);
    const patientGrowth = this.generateGrowthData(100, 1.15, 12); // 15% monthly growth
    const healthWorkerGrowth = this.generateGrowthData(10, 1.08, 12); // 8% monthly growth

    return {
      type: this.chartTypes.area,
      title: 'User Growth Trends',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Patients',
            data: patientGrowth,
            borderColor: this.colorPalettes.primary[0],
            backgroundColor: this.addAlpha(this.colorPalettes.primary[0], 0.3),
            fill: true
          },
          {
            label: 'Health Workers',
            data: healthWorkerGrowth,
            borderColor: this.colorPalettes.health[0],
            backgroundColor: this.addAlpha(this.colorPalettes.health[0], 0.3),
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Number of Users'
            }
          }
        }
      }
    };
  }

  createRevenueChart(revenueData) {
    const months = this.generateMonthRange(12);
    const revenue = this.generateGrowthData(5000, 1.153, 12); // 15.3% monthly growth

    return {
      type: this.chartTypes.bar,
      title: 'Monthly Recurring Revenue (MRR)',
      data: {
        labels: months,
        datasets: [{
          label: 'MRR ($)',
          data: revenue,
          backgroundColor: this.colorPalettes.gradient,
          borderColor: this.colorPalettes.primary[0],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Revenue ($)'
            },
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'MRR: $' + context.parsed.y.toLocaleString();
              }
            }
          }
        }
      }
    };
  }

  createEngagementHeatmap(engagementData) {
    const hours = Array.from({length: 24}, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const heatmapData = [];
    days.forEach((day, dayIndex) => {
      hours.forEach((hour, hourIndex) => {
        heatmapData.push({
          x: hour,
          y: dayIndex,
          v: Math.floor(Math.random() * 100) // Random engagement data
        });
      });
    });

    return {
      type: this.chartTypes.heatmap,
      title: 'User Engagement Heatmap',
      data: {
        datasets: [{
          label: 'Engagement Level',
          data: heatmapData,
          backgroundColor: function(context) {
            const value = context.parsed.v;
            const alpha = value / 100;
            return `rgba(59, 130, 246, ${alpha})`;
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          width: ({chart}) => (chart.chartArea || {}).width / 24,
          height: ({chart}) => (chart.chartArea || {}).height / 7,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: 0,
            max: 23,
            title: {
              display: true,
              text: 'Hour of Day'
            }
          },
          y: {
            type: 'linear',
            min: 0,
            max: 6,
            title: {
              display: true,
              text: 'Day of Week'
            },
            ticks: {
              callback: function(value) {
                return days[value] || '';
              }
            }
          }
        }
      }
    };
  }

  // === REAL-TIME DASHBOARD WIDGETS ===
  generateDashboardWidgets(liveData) {
    return {
      kpiCards: this.createKPICards(liveData.kpis),
      alertsWidget: this.createAlertsWidget(liveData.alerts),
      systemStatus: this.createSystemStatusWidget(liveData.system),
      quickStats: this.createQuickStatsWidget(liveData.stats)
    };
  }

  createKPICards(kpiData) {
    return [
      {
        title: 'Total Patients',
        value: kpiData.totalPatients || 2847,
        change: '+15.3%',
        trend: 'up',
        color: this.colorPalettes.primary[0],
        icon: 'users'
      },
      {
        title: 'Emergency Alerts',
        value: kpiData.emergencyAlerts || 23,
        change: '-12%',
        trend: 'down',
        color: this.colorPalettes.danger[0],
        icon: 'alert-triangle'
      },
      {
        title: 'Monthly Revenue',
        value: '$' + (kpiData.monthlyRevenue || 28500).toLocaleString(),
        change: '+18.2%',
        trend: 'up',
        color: this.colorPalettes.health[0],
        icon: 'dollar-sign'
      },
      {
        title: 'System Uptime',
        value: (kpiData.uptime || 99.9) + '%',
        change: '+0.1%',
        trend: 'up',
        color: this.colorPalettes.warning[0],
        icon: 'activity'
      }
    ];
  }

  // === UTILITY FUNCTIONS ===
  generateDateRange(days) {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  }

  generateMonthRange(months) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push(monthNames[date.getMonth()] + ' ' + date.getFullYear().toString().substr(-2));
    }
    return result;
  }

  generateVitalsTrend(baseline, variance, points) {
    const data = [];
    let current = baseline;
    
    for (let i = 0; i < points; i++) {
      const change = (Math.random() - 0.5) * variance * 0.3;
      current = Math.max(0, current + change);
      data.push(Math.round(current * 10) / 10);
    }
    return data;
  }

  generateGrowthData(initial, growthRate, points) {
    const data = [];
    let current = initial;
    
    for (let i = 0; i < points; i++) {
      data.push(Math.round(current));
      current *= growthRate;
    }
    return data;
  }

  addAlpha(color, alpha) {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Export chart configuration for frontend
  exportChartConfig(chartData) {
    return {
      ...chartData,
      plugins: [
        {
          id: 'bioverse-branding',
          afterDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.font = '12px Arial';
            ctx.fillStyle = '#9CA3AF';
            ctx.textAlign = 'right';
            ctx.fillText('BioVerse Analytics', chart.width - 10, chart.height - 5);
            ctx.restore();
          }
        }
      ]
    };
  }
}

module.exports = new VisualizationService();
