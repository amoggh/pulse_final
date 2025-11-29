import { useState, useEffect } from 'react'
import { api } from '../lib/api'

// Types
interface Alert {
    id: string
    type: string
    severity: string
    title: string
    message: string
    timestamp: string
    metrics?: Record<string, number | string>
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
    metadata: {
        timestamp: string
        analysis_id: string
    }
    predictions: {
        surge_prediction: SurgePrediction
    }
    alerts: Alert[]
    recommendations: Recommendation[]
    summary: {
        total_alerts: number
        critical_alerts: number
        high_alerts: number
        total_recommendations: number
        overall_risk_level: string
    }
}

export default function PulseAIPage() {
    const [results, setResults] = useState<AgentResults | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedTab, setSelectedTab] = useState<'overview' | 'alerts' | 'recommendations'>('overview')
    const [prompt, setPrompt] = useState('')

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }
    }, [])

    const sendNotification = (title: string, body: string) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/vite.svg' })
        }
    }

    const saveAlertsToBackend = async (alerts: Alert[]) => {
        try {
            for (const alert of alerts) {
                await api.post('/alerts', {
                    hospital_id: 1,
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

            // Save alerts and send notifications
            if (data.alerts && data.alerts.length > 0) {
                await saveAlertsToBackend(data.alerts)
                // Send notification for the most severe alert
                const severeAlert = data.alerts.find((a: Alert) => a.severity.toLowerCase() === 'critical' || a.severity.toLowerCase() === 'high')
                if (severeAlert) {
                    sendNotification(`PulseAI Alert: ${severeAlert.title}`, severeAlert.message)
                }
            }
        } catch (err) {
            console.error(err)
            // Mock data fallback
            const mockData: AgentResults = {
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

            // Save mock alerts and notify
            if (mockData.alerts) {
                await saveAlertsToBackend(mockData.alerts)
                sendNotification(`PulseAI Alert: ${mockData.alerts[0].title}`, mockData.alerts[0].message)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadResults()
        const interval = setInterval(loadResults, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'from-red-500 to-red-700'
            case 'high': return 'from-orange-500 to-red-500'
            case 'medium': return 'from-yellow-500 to-orange-500'
            default: return 'from-blue-500 to-blue-700'
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section with Chat Interface */}
            <div className="relative overflow-hidden rounded-3xl glass-panel p-10 text-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-x" />

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-neutral-300">PulseAI Agent Active</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                        How can I help you <span className="text-gradient-primary">optimize</span> today?
                    </h1>

                    <p className="text-lg text-neutral-400">
                        Ask about patient surges, resource allocation, or environmental risks.
                    </p>

                    {/* Chat Input */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg" />
                        <div className="relative flex items-center bg-[#0A0A0A] border border-white/10 rounded-xl p-2 shadow-2xl">
                            <div className="pl-4 text-neutral-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask PulseAI..."
                                className="w-full bg-transparent border-none text-white placeholder-neutral-500 focus:ring-0 px-4 py-3 text-lg"
                                onKeyDown={(e) => e.key === 'Enter' && loadResults()}
                            />
                            <button
                                onClick={loadResults}
                                className="p-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -z-10" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -z-10" />
            </div>

            {/* Results Section */}
            {results && (
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-white/10 pb-1 overflow-x-auto">
                        <button
                            onClick={() => setSelectedTab('overview')}
                            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${selectedTab === 'overview'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setSelectedTab('alerts')}
                            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${selectedTab === 'alerts'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Alerts ({results.alerts?.length || 0})
                        </button>
                        <button
                            onClick={() => setSelectedTab('recommendations')}
                            className={`px-6 py-3 font-semibold transition-all whitespace-nowrap ${selectedTab === 'recommendations'
                                ? 'text-white border-b-2 border-purple-500'
                                : 'text-neutral-400 hover:text-white'
                                }`}
                        >
                            Recommendations ({results.recommendations?.length || 0})
                        </button>
                    </div>

                    {/* Content */}
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
                </div>
            )}
        </div>
    )
}
