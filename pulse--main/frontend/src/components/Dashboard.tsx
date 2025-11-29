import { useState, useEffect } from 'react';
import { Activity, Users, Wind, AlertCircle } from 'lucide-react';
import { KPITile } from './KPITile';
import { ControlPanel } from './ControlPanel';
import { ForecastChart } from './ForecastChart';
import { AgentPanel } from './AgentPanel';

export function Dashboard() {
    const [aqi, setAqi] = useState(156);
    const [isFestival, setIsFestival] = useState(false);
    const [horizon, setHorizon] = useState(7);
    const [useSimulation, setUseSimulation] = useState(false);
    const [forecastData, setForecastData] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [kpis, setKpis] = useState<any>(null);
    const [forecastExplanation, setForecastExplanation] = useState("");
    const [forecastMethodology, setForecastMethodology] = useState<string[]>([]);
    const [riskExplanation, setRiskExplanation] = useState("");

    useEffect(() => {
        // Fetch Forecast
        fetch('http://localhost:8000/api/forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                horizon_days: horizon,
                aqi_override: useSimulation ? aqi : undefined,
                is_festival: isFestival
            })
        })
            .then(res => res.json())
            .then(data => {
                setForecastData(data.forecasts);
                if (data.summary?.explanation) {
                    setForecastExplanation(data.summary.explanation);
                }
                if (data.summary?.methodology) {
                    setForecastMethodology(data.summary.methodology);
                }
            })
            .catch(err => console.error("Failed to fetch forecast", err));

        // Fetch Recommendations (LLM Decision Engine)
        const decisionUrl = useSimulation
            ? `http://localhost:8000/api/decision/evaluate?aqi_override=${aqi}`
            : 'http://localhost:8000/api/decision/evaluate';

        fetch(decisionUrl)
            .then(res => res.json())
            .then(data => {
                if (data.score_explanation) {
                    setRiskExplanation(data.score_explanation);
                }

                // Helper to map ActionItem to Recommendation
                const mapAction = (item: any, category: string) => ({
                    id: `act_${Math.random().toString(36).substr(2, 9)}`,
                    category: category,
                    action: item.action,
                    reasoning: item.details ? [item.details] : ["AI Generated Action"],
                    risk_score: item.priority === 'High' ? 0.9 : item.priority === 'Medium' ? 0.6 : 0.3,
                    status: item.priority === 'High' ? 'urgent' : 'pending'
                });

                // Flatten and map structured actions
                const allActions = [
                    ...(data.actions.staffing || []).map((i: any) => mapAction(i, 'Staffing')),
                    ...(data.actions.supplies || []).map((i: any) => mapAction(i, 'Supplies')),
                    ...(data.actions.bed_management || []).map((i: any) => mapAction(i, 'Bed Mgmt')),
                    ...(data.actions.advisory || []).map((i: any) => mapAction(i, 'Advisory'))
                ];
                setRecommendations(allActions);
            })
            .catch(err => console.error("Failed to fetch decision", err));

        // Fetch KPIs (Mocked for now if endpoint fails or just use static)
        fetch('http://localhost:8000/api/kpi')
            .then(res => res.json())
            .then(data => setKpis(data))
            .catch(() => {
                setKpis({
                    occupancy: 87,
                    admissions_24h: 42,
                    aqi: aqi,
                    risk_score: 65
                });
            });

    }, [aqi, isFestival, horizon]);

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-4">
                <KPITile
                    title="Current Occupancy"
                    value={`${kpis?.occupancy || 0}%`}
                    trend={5}
                    icon={Users}
                    color={kpis?.occupancy > 90 ? "destructive" : "primary"}
                />
                <KPITile
                    title="Predicted Admissions (24h)"
                    value={kpis?.admissions_24h || 0}
                    trend={12}
                    icon={Activity}
                    color="warning"
                />
                <KPITile
                    title="Live AQI"
                    value={aqi}
                    unit="PM2.5"
                    icon={Wind}
                    color={aqi > 200 ? "destructive" : "success"}
                />
                <KPITile
                    title="Operational Risk Score"
                    value={kpis?.risk_score || 0}
                    unit="/ 100"
                    icon={AlertCircle}
                    color={kpis?.risk_score > 70 ? "destructive" : kpis?.risk_score > 40 ? "warning" : "success"}
                />
            </div>

            {/* AI Insights Row */}
            {(forecastExplanation || riskExplanation) && (
                <div className="grid grid-cols-2 gap-4">
                    {forecastExplanation && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-primary">Forecast Insight</h4>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                                {useSimulation ? `🎮 Simulation (AQI: ${aqi})` : `📊 Live CSV (AQI: ${kpis?.aqi || 'N/A'})`}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{forecastExplanation}</p>
                                    </div>
                                </div>
                            </div>
                            {forecastMethodology.length > 0 && (
                                <div className="ml-8 mt-1 text-xs text-muted-foreground bg-background/50 p-2 rounded border border-border">
                                    <p className="font-semibold mb-1">Methodology:</p>
                                    <ul className="list-disc pl-3 space-y-0.5">
                                        {forecastMethodology.map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {riskExplanation && (
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-destructive">Risk Analysis</h4>
                                <p className="text-sm text-muted-foreground">{riskExplanation}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Main Forecast Chart */}
                <div className="col-span-8 flex flex-col gap-6">
                    <ForecastChart data={forecastData} />
                    <AgentPanel recommendations={recommendations} />
                </div>

                {/* Control Panel */}
                <div className="col-span-4">
                    <ControlPanel
                        aqi={aqi}
                        setAqi={setAqi}
                        isFestival={isFestival}
                        setIsFestival={setIsFestival}
                        horizon={horizon}
                        setHorizon={setHorizon}
                        useSimulation={useSimulation}
                        setUseSimulation={setUseSimulation}
                    />
                </div>
            </div>
        </div>
    );
}
