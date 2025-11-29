import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Users, Package, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ScenarioKey = 'baseline' | 'high_aqi' | 'festival' | 'combined';

interface ScenarioPoint {
    ds?: string;
    date?: string;
    yhat?: number;
    predicted?: number;
}

interface ScenarioStats {
    average: number;
    peak: number;
}

interface ScenarioResponse {
    baseline: ScenarioPoint[];
    high_aqi: ScenarioPoint[];
    festival: ScenarioPoint[];
    combined: ScenarioPoint[];
    baseline_stats?: ScenarioStats;
    high_aqi_stats?: ScenarioStats;
    festival_stats?: ScenarioStats;
    combined_stats?: ScenarioStats;
    current_aqi?: number;
    horizon_days?: number;
}

export function ScenarioSandbox() {
    const [scenarios, setScenarios] = useState<ScenarioResponse | null>(null);
    const [selectedScenarios, setSelectedScenarios] = useState<ScenarioKey[]>(['baseline', 'high_aqi', 'festival']);
    const [staffingCost, setStaffingCost] = useState(0);
    const [supplyCost, setSupplyCost] = useState(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [horizon, setHorizon] = useState(7);

    const fetchScenarios = () => {
        setLoading(true);
        setError(null);
        fetch(`http://localhost:8000/api/scenarios?horizon_days=${horizon}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`API error ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setScenarios(data);
                calculateCosts(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch scenarios", err);
                setError("Could not load scenarios. Please retry.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchScenarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [horizon]);

    const calculateCosts = (scenarioData: any) => {
        if (!scenarioData) return;

        // Calculate additional staffing cost for high AQI scenario
        // Assuming we need 5 additional nurses at ₹450/hour for 8 hours/day for 7 days
        const additionalNurses = 5;
        const hourlyRate = 450;
        const hoursPerDay = 8;
        const days = 7;
        const staffCost = additionalNurses * hourlyRate * hoursPerDay * days;
        setStaffingCost(staffCost);

        // Calculate additional supply cost
        // Assuming increased respiratory supply needs: 20 nebulizers at ₹12,500 each
        const additionalNebulizers = 20;
        const nebulizerCost = 12500;
        const supplyCostTotal = additionalNebulizers * nebulizerCost;
        setSupplyCost(supplyCostTotal);
    };

    const toggleScenario = (scenario: ScenarioKey) => {
        setSelectedScenarios(prev =>
            prev.includes(scenario)
                ? prev.filter(s => s !== scenario)
                : [...prev, scenario]
        );
    };

    const scenarioSeries = useMemo(() => ({
        baseline: scenarios?.baseline || [],
        high_aqi: scenarios?.high_aqi || [],
        festival: scenarios?.festival || [],
        combined: scenarios?.combined || []
    }), [scenarios]);

    // Transform data for chart (handles uneven lengths)
    const chartData = useMemo(() => {
        const seriesList = Object.values(scenarioSeries);
        const maxLength = Math.max(0, ...seriesList.map(series => series.length));

        if (maxLength === 0) return [];

        const getValue = (series: any[], idx: number) => {
            const point = series?.[idx];
            if (!point) return null;
            return point.yhat ?? point.predicted ?? null;
        };

        const formatDate = (idx: number) => {
            const point = scenarioSeries.baseline[idx] || scenarioSeries.high_aqi[idx] || scenarioSeries.festival[idx] || scenarioSeries.combined[idx];
            const rawDate = point?.ds || point?.date;
            if (!rawDate) return `Day ${idx + 1}`;
            const d = new Date(rawDate);
            return isNaN(d.getTime()) ? rawDate : `${d.getMonth() + 1}/${d.getDate()}`;
        };

        return Array.from({ length: maxLength }).map((_, idx) => ({
            date: formatDate(idx),
            Baseline: selectedScenarios.includes('baseline') ? getValue(scenarioSeries.baseline, idx) : null,
            'High AQI': selectedScenarios.includes('high_aqi') ? getValue(scenarioSeries.high_aqi, idx) : null,
            Festival: selectedScenarios.includes('festival') ? getValue(scenarioSeries.festival, idx) : null,
            Combined: selectedScenarios.includes('combined') ? getValue(scenarioSeries.combined, idx) : null
        }));
    }, [scenarioSeries, selectedScenarios]);

    const scenarioColors = {
        Baseline: 'hsl(var(--primary))',
        'High AQI': 'hsl(var(--destructive))',
        Festival: 'hsl(var(--warning))',
        Combined: 'hsl(var(--secondary))'
    };

    return (
        <motion.div
            className="p-6 h-full flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Scenario Sandbox</h1>
                    <p className="text-muted-foreground">Compare operational scenarios and cost impacts</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col text-xs text-muted-foreground">
                        <label className="font-semibold">Forecast Horizon</label>
                        <select
                            className="bg-card border border-border rounded-md px-2 py-1 text-sm"
                            value={horizon}
                            onChange={(e) => setHorizon(parseInt(e.target.value))}
                        >
                            {[7, 10, 14].map(option => (
                                <option key={option} value={option}>{option} days</option>
                            ))}
                        </select>
                    </div>
                    <motion.button
                        onClick={fetchScenarios}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        {loading ? 'Running...' : 'Run Simulation'}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-6 flex-1">
                {/* Scenario Selection */}
                <div className="col-span-3 bg-card border border-border rounded-xl p-4 flex flex-col gap-4">
                    <h3 className="font-semibold">Scenarios</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedScenarios.includes('baseline')}
                                onChange={() => toggleScenario('baseline')}
                                className="w-4 h-4 rounded"
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-sm font-medium">Baseline</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedScenarios.includes('high_aqi')}
                                onChange={() => toggleScenario('high_aqi')}
                                className="w-4 h-4 rounded"
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-destructive" />
                                <span className="text-sm font-medium">High AQI (250)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedScenarios.includes('festival')}
                                onChange={() => toggleScenario('festival')}
                                className="w-4 h-4 rounded"
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-warning" />
                                <span className="text-sm font-medium">Festival Period</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                            <input
                                type="checkbox"
                                checked={selectedScenarios.includes('combined')}
                                onChange={() => toggleScenario('combined')}
                                className="w-4 h-4 rounded"
                            />
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-secondary" />
                                <span className="text-sm font-medium">High AQI + Festival</span>
                            </div>
                        </div>
                    </div>

                    {/* Scenario Stats */}
                    {scenarios && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-border">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Baseline Avg</p>
                                <p className="text-lg font-bold">{scenarios.baseline_stats?.average} admissions/day</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">High AQI Avg</p>
                                <p className="text-lg font-bold text-destructive">{scenarios.high_aqi_stats?.average} admissions/day</p>
                                <p className="text-xs text-destructive">+{((scenarios.high_aqi_stats?.average ?? 0) - (scenarios.baseline_stats?.average ?? 0)).toFixed(1)} vs baseline</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Festival Avg</p>
                                <p className="text-lg font-bold text-warning">{scenarios.festival_stats?.average} admissions/day</p>
                                <p className="text-xs text-warning">+{((scenarios.festival_stats?.average ?? 0) - (scenarios.baseline_stats?.average ?? 0)).toFixed(1)} vs baseline</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart and Metrics */}
                <div className="col-span-9 flex flex-col gap-6">
                    <div className="flex-1 bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Comparative Forecast ({horizon} Days)</h3>
                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-sm">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}
                        </div>
                        <div className="h-[400px]">
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Running simulation...
                                </div>
                            ) : chartData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    No data available for the selected scenarios.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Admissions', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                        <Legend />
                                        {selectedScenarios.includes('baseline') && (
                                            <Line type="monotone" dataKey="Baseline" stroke={scenarioColors.Baseline} strokeWidth={2} dot={{ r: 4 }} />
                                        )}
                                        {selectedScenarios.includes('high_aqi') && (
                                            <Line type="monotone" dataKey="High AQI" stroke={scenarioColors['High AQI']} strokeWidth={2} dot={{ r: 4 }} />
                                        )}
                                        {selectedScenarios.includes('festival') && (
                                            <Line type="monotone" dataKey="Festival" stroke={scenarioColors.Festival} strokeWidth={2} dot={{ r: 4 }} />
                                        )}
                                        {selectedScenarios.includes('combined') && (
                                            <Line type="monotone" dataKey="Combined" stroke={scenarioColors.Combined} strokeWidth={2} dot={{ r: 4 }} />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Cost Impact Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-destructive" />
                                <p className="text-sm text-muted-foreground">Admission Surge</p>
                            </div>
                            <p className="text-2xl font-bold text-destructive">+{scenarios ? ((scenarios.high_aqi_stats?.peak ?? 0) - (scenarios.baseline_stats?.peak ?? 0)).toFixed(0) : '0'}</p>
                            <p className="text-xs text-muted-foreground">Peak day increase</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-warning" />
                                <p className="text-sm text-muted-foreground">Staffing Cost</p>
                            </div>
                            <p className="text-2xl font-bold text-warning">₹{staffingCost.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Additional 7-day cost</p>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-primary" />
                                <p className="text-sm text-muted-foreground">Supply Cost</p>
                            </div>
                            <p className="text-2xl font-bold text-primary">₹{supplyCost.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Respiratory equipment</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
