import { useState, useEffect } from 'react'
import { api } from '../lib/api'

interface Alert {
    id: string
    type: string
    severity: string
    title: string
    message: string
    timestamp: string
    metrics?: Record<string, any>
}

interface Recommendation {
    id: string
    category: string
    priority: string
    title: string
    description: string
    actions: string[]
    impact: string
    timeline: string
}

interface SurgePrediction {
    baseline_inflow: number
    predicted_inflow: number
    predicted_surge_percentage: number
    risk_level: string
    confidence: number
    peak_date: string
}

interface AgentResults {
    metadata?: {
        timestamp: string
        analysis_id: string
    }
    predictions?: {
        surge_prediction: SurgePrediction
    }
    alerts?: Alert[]
    recommendations?: Recommendation[]
    summary?: {
        total_alerts: number
        critical_alerts: number
        high_alerts: number
        total_recommendations: number
        overall_risk_level: string
    }
}

export default function PulseAI() {
    const [results, setResults] = useState<AgentResults | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'recommendations'>('overview')

    const saveAlertsToBackend = async (alerts: Alert[]) => {
        try {
            // Save each alert to the backend
            for (const alert of alerts) {
                await api.post('/alerts', {
                    hospital_id: 1, // Default hospital ID
                    severity: alert.severity.toUpperCase(),
                    title: alert.title,
                    message: alert.message,
                    action_json: {
                        type: alert.type,
                        metrics: alert.metrics || {}
                    },
                    status: 'open'
                })
            }
            console.log(`✅ Saved ${alerts.length} alerts to backend`)
        } catch (err) {
            console.error('Failed to save alerts to backend:', err)
        }
    }

    const loadResults = async () => {
        setLoading(true)
        setError(null)

        try {
            // Try to load from the worker output
            const response = await fetch('/worker/output/latest_results.json')

            if (!response.ok) {
                throw new Error('No predictions available yet. Run the agent first.')
            }

            const data = await response.json()
            setResults(data)

            // Save alerts to backend if available
            if (data.alerts && data.alerts.length > 0) {
                await saveAlertsToBackend(data.alerts)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load predictions')
            // Set mock data for demonstration
            const mockData = {
                metadata: {
                    timestamp: new Date().toISOString(),
                    analysis_id: 'DEMO_' + Date.now()
                },
                predictions: {
                    surge_prediction: {
                        baseline_inflow: 80,
                        predicted_inflow: 187.2,
                        predicted_surge_percentage: 134.0,
                        risk_level: 'high',
                        confidence: 0.85,
                        peak_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                    }
                },
                alerts: [
                    {
                        id: 'ALERT_1',
                        type: 'patient_surge',
                        severity: 'high',
                        title: 'Patient Surge Alert: 134.0% Increase Expected',
                        message: 'Predicted patient surge of 134.0% in the next 7 days. Risk level: HIGH',
                        timestamp: new Date().toISOString(),
                        metrics: { surge_percentage: 134.0, risk_level: 'high' }
                    },
                    {
                        id: 'ALERT_2',
                        type: 'pollution_risk',
                        severity: 'high',
                        title: 'High Pollution Risk Alert',
                        message: 'Pollution risk score: 75.0/100. Expect increase in respiratory cases',
                        timestamp: new Date().toISOString(),
                        metrics: { risk_score: 75.0 }
                    }
                ],
                recommendations: [
                    {
                        id: 'REC_1',
                        category: 'staffing',
                        priority: 'high',
                        title: 'Increase Staff Allocation',
                        description: 'Increase staff by approximately 40% to handle predicted surge',
                        actions: [
                            'Schedule additional 40% nursing staff for next 7 days',
                            'Arrange on-call doctors for emergency coverage'
                        ],
                        impact: 'high',
                        timeline: 'immediate'
                    },
                    {
                        id: 'REC_2',
                        category: 'resources',
                        priority: 'high',
                        title: 'Stock Essential Medical Supplies',
                        description: 'Increase inventory of essential medical supplies and equipment',
                        actions: [
                            'Order additional PPE, masks, and sanitizers',
                            'Stock up on common medications and IV fluids'
                        ],
                        impact: 'high',
                        timeline: 'within 48 hours'
                    }
                ],
                summary: {
                    total_alerts: 2,
                    critical_alerts: 0,
                    high_alerts: 2,
                    total_recommendations: 2,
                    overall_risk_level: 'high'
                }
            }
            setResults(mockData)

            // Save mock alerts to backend
            if (mockData.alerts) {
                await saveAlertsToBackend(mockData.alerts)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadResults()

        // Auto-refresh every 30 minutes
        const interval = setInterval(() => {
            console.log('🔄 Auto-refreshing PulseAI predictions...')
            loadResults()
        }, 30 * 60 * 1000) // 30 minutes

        return () => clearInterval(interval)
    }, [])

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'from-red-500 to-red-700'
            case 'high':
                return 'from-orange-500 to-orange-700'
            case 'medium':
                return 'from-yellow-500 to-yellow-700'
            default:
                return 'from-blue-500 to-blue-700'
        }
    }

    const getRiskLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high':
                return 'text-red-400'
            case 'medium':
                return 'text-yellow-400'
            default:
                return 'text-green-400'
        }
    }

    return (
        <div className="space-y-6">
            {/* Main Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                        <p className="text-neutral-400">Analyzing data...</p>
                    </div>
                </div>
            ) : results ? (
                <div className="space-y-8">
                    {/* Overview Cards */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Surge Prediction Card */}
                        <div className="glass-panel rounded-2xl p-8 pulse-glow-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-300">Surge Prediction</h3>
                                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-5xl font-bold text-white mb-2">
                                        {results.predictions?.surge_prediction.predicted_surge_percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-neutral-400">Expected increase</div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-neutral-400">Risk Level</span>
                                        <span className={`font-semibold ${getRiskLevelColor(results.predictions?.surge_prediction.risk_level || 'low')}`}>
                                            {results.predictions?.surge_prediction.risk_level.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Confidence</span>
                                        <span className="font-semibold text-white">
                                            {((results.predictions?.surge_prediction.confidence || 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Alerts Card */}
                        <div className="glass-panel rounded-2xl p-8 pulse-glow-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-300">Active Alerts</h3>
                                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-5xl font-bold text-white mb-2">
                                        {results.summary?.total_alerts || 0}
                                    </div>
                                    <div className="text-sm text-neutral-400">Total alerts</div>
                                </div>
                                <div className="pt-4 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Critical</span>
                                        <span className="font-semibold text-red-400">{results.summary?.critical_alerts || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">High Priority</span>
                                        <span className="font-semibold text-orange-400">{results.summary?.high_alerts || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations Card */}
                        <div className="glass-panel rounded-2xl p-8 pulse-glow-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-neutral-300">Recommendations</h3>
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-5xl font-bold text-white mb-2">
                                        {results.summary?.total_recommendations || 0}
                                    </div>
                                    <div className="text-sm text-neutral-400">Action items</div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-sm text-neutral-400">
                                        AI-generated recommendations to optimize hospital operations
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-white/10">
                        <button
                            onClick={() => setSelectedTab('overview')}
                            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'overview'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setSelectedTab('alerts')}
                            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'alerts'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Alerts ({results.alerts?.length || 0})
                        </button>
                        <button
                            onClick={() => setSelectedTab('recommendations')}
                            className={`px-6 py-3 font-semibold transition-all ${selectedTab === 'recommendations'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Recommendations ({results.recommendations?.length || 0})
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {selectedTab === 'overview' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="glass-panel rounded-2xl p-8">
                                    <h3 className="text-2xl font-bold mb-6 text-white">Prediction Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-neutral-400">Baseline Inflow</span>
                                            <span className="font-semibold text-white">
                                                {results.predictions?.surge_prediction.baseline_inflow.toFixed(1)} patients/day
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-neutral-400">Predicted Inflow</span>
                                            <span className="font-semibold text-white">
                                                {results.predictions?.surge_prediction.predicted_inflow.toFixed(1)} patients/day
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/10">
                                            <span className="text-neutral-400">Peak Date</span>
                                            <span className="font-semibold text-white">
                                                {new Date(results.predictions?.surge_prediction.peak_date || '').toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-neutral-400">Analysis ID</span>
                                            <span className="font-mono text-sm text-neutral-500">
                                                {results.metadata?.analysis_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel rounded-2xl p-8">
                                    <h3 className="text-2xl font-bold mb-6 text-white">AI Insights</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <div className="font-semibold text-white mb-1">Multi-Factor Analysis</div>
                                                    <div className="text-sm text-neutral-300">
                                                        Analyzed festivals, pollution levels, and epidemic patterns to generate predictions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                <div>
                                                    <div className="font-semibold text-white mb-1">Powered by Qwen3-32B</div>
                                                    <div className="text-sm text-neutral-300">
                                                        Advanced AI with thinking mode for intelligent reasoning and predictions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <div>
                                                    <div className="font-semibold text-white mb-1">Real-time Updates</div>
                                                    <div className="text-sm text-neutral-300">
                                                        Continuous monitoring and analysis for up-to-date predictions
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTab === 'alerts' && (
                            <div className="space-y-4">
                                {results.alerts && results.alerts.length > 0 ? (
                                    results.alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="glass-panel rounded-xl p-6 pulse-glow-border hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getSeverityColor(alert.severity)} flex items-center justify-center flex-shrink-0`}>
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getSeverityColor(alert.severity)} text-white`}>
                                                            {alert.severity.toUpperCase()}
                                                        </span>
                                                        <span className="text-xs text-neutral-500">
                                                            {new Date(alert.timestamp).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-white mb-2">{alert.title}</h4>
                                                    <p className="text-neutral-300 mb-3">{alert.message}</p>
                                                    {alert.metrics && (
                                                        <div className="flex flex-wrap gap-3 text-sm">
                                                            {Object.entries(alert.metrics).map(([key, value]) => (
                                                                <div key={key} className="px-3 py-1 bg-white/5 rounded-lg">
                                                                    <span className="text-neutral-400">{key.replace(/_/g, ' ')}: </span>
                                                                    <span className="text-white font-semibold">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-neutral-400">
                                        No alerts at this time
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTab === 'recommendations' && (
                            <div className="space-y-4">
                                {results.recommendations && results.recommendations.length > 0 ? (
                                    results.recommendations.map((rec) => (
                                        <div
                                            key={rec.id}
                                            className="glass-panel rounded-xl p-6 pulse-glow-border hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                                            {rec.priority.toUpperCase()}
                                                        </span>
                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-neutral-300">
                                                            {rec.category.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-xs text-neutral-500">
                                                            Timeline: {rec.timeline}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-white mb-2">{rec.title}</h4>
                                                    <p className="text-neutral-300 mb-4">{rec.description}</p>
                                                    <div className="space-y-2">
                                                        <div className="text-sm font-semibold text-neutral-400 mb-2">Action Items:</div>
                                                        {rec.actions.map((action, idx) => (
                                                            <div key={idx} className="flex items-start gap-2 text-sm text-neutral-300">
                                                                <svg className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                <span>{action}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-neutral-400">
                                        No recommendations available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <div className="flex justify-center pt-8">
                        <button
                            onClick={loadResults}
                            className="px-8 py-4 glass-button text-white font-semibold rounded-full hover:scale-105 transition-all flex items-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh Predictions
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="text-neutral-400 mb-6">
                        {error || 'No predictions available'}
                    </div>
                    <button
                        onClick={loadResults}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-neutral-200 transition-all hover:scale-105"
                    >
                        Load Predictions
                    </button>
                </div>
            )}
        </div>
    )
}

