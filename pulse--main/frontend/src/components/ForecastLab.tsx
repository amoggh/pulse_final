import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, BarChart, Bar, Cell } from 'recharts';
import { Download, Sliders, Activity, Info, TrendingUp, AlertCircle } from 'lucide-react';
import type { ForecastPoint, ForecastSummary, ForecastMetrics, FeatureImportance } from '../types/forecast';

interface ForecastLabData {
    predictions: ForecastPoint[];
    summary: ForecastSummary;
    metrics: ForecastMetrics | null;
    feature_importance: FeatureImportance[];
}

export function ForecastLab() {
    const [horizon, setHorizon] = useState(14);
    const [aqi, setAqi] = useState(150);
    const [isFestival, setIsFestival] = useState(false);
    const [forecastData, setForecastData] = useState<ForecastLabData | null>(null);
    const [metrics, setMetrics] = useState<ForecastMetrics | null>(null);
    const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);

    const fetchData = useCallback(() => {
        fetch('http://localhost:8000/api/forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                horizon_days: horizon,
                aqi_override: aqi,
                is_festival: isFestival
            })
        })
            .then(res => res.json())
            .then((data: { forecasts?: ForecastPoint[]; predictions?: ForecastPoint[]; summary?: ForecastSummary; metrics?: ForecastMetrics; feature_importance?: FeatureImportance[] }) => {
                // Handle both formats: {forecasts: [...]} or {predictions: [...]}
                const predictions = data.forecasts || data.predictions || [];
                setForecastData({
                    predictions: predictions,
                    summary: data.summary || {
                        avg_predicted_admissions: 0,
                        avg_baseline_admissions: 0,
                        peak_day: '',
                        peak_value: 0
                    },
                    metrics: data.metrics || null,
                    feature_importance: data.feature_importance || []
                });
                if (data.metrics) setMetrics(data.metrics);
                if (data.feature_importance) setFeatureImportance(data.feature_importance);
            })
            .catch(err => {
                console.error("Failed to fetch forecast", err);
                // Set empty data structure on error
                setForecastData({
                    predictions: [],
                    summary: {
                        avg_predicted_admissions: 0,
                        avg_baseline_admissions: 0,
                        peak_day: '',
                        peak_value: 0
                    },
                    metrics: null,
                    feature_importance: []
                });
            });
    }, [aqi, horizon, isFestival]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExport = () => {
        const predictions = forecastData?.predictions || [];
        if (!predictions || predictions.length === 0) {
            alert("No forecast data available to export. Please wait for the forecast to load.");
            return;
        }

        const headers = ["Date", "Predicted", "Baseline", "Lower CI", "Upper CI"];
        const csvRows = [
            headers.join(","),
            ...predictions.map((row: any) => {
                const date = row.date || row.ds || '';
                const predicted = row.predicted || row.yhat || 0;
                const baseline = row.baseline || row.y || 0;
                const lower = row.confidence_low || row.yhat_lower || 0;
                const upper = row.confidence_high || row.yhat_upper || 0;
                return `${date},${predicted},${baseline},${lower},${upper}`;
            })
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forecast_lab_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <motion.div
            className="p-6 h-full flex flex-col gap-6 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <motion.div
                className="flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Forecast Lab</h1>
                    <p className="text-muted-foreground">Advanced model analytics and scenario simulation</p>
                </div>
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium"
                        whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--secondary) / 0.8)" }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-12 gap-6">
                {/* Controls & Metrics Column */}
                <div className="col-span-3 flex flex-col gap-6">
                    {/* Controls */}
                    <div className="bg-card border border-border rounded-xl p-5 space-y-6">
                        <div className="flex items-center gap-2 font-semibold mb-2">
                            <Sliders className="w-4 h-4" /> Simulation Controls
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">Forecast Horizon (Days)</label>
                            <input
                                type="range"
                                min="7" max="30"
                                value={horizon}
                                onChange={(e) => setHorizon(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>7d</span>
                                <span className="font-bold text-primary">{horizon}d</span>
                                <span>30d</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium">AQI Override</label>
                            <input
                                type="range"
                                min="50" max="500"
                                value={aqi}
                                onChange={(e) => setAqi(parseInt(e.target.value))}
                                className={aqi > 200 ? "accent-destructive" : "accent-primary"}
                                style={{ width: '100%' }}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Good (50)</span>
                                <span className={`font-bold ${aqi > 200 ? 'text-destructive' : 'text-primary'}`}>{aqi}</span>
                                <span>Hazardous (500)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="text-sm font-medium">Festival Mode</label>
                            <button
                                onClick={() => setIsFestival(!isFestival)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${isFestival ? 'bg-primary' : 'bg-secondary'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isFestival ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Model Metrics */}
                    {metrics && (
                        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-2 font-semibold">
                                <Activity className="w-4 h-4" /> Model Performance
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">MAPE</p>
                                    <p className="text-xl font-bold">{metrics.mape}%</p>
                                </div>
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">R² Score</p>
                                    <p className="text-xl font-bold">{metrics.r2}</p>
                                </div>
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">MAE</p>
                                    <p className="text-xl font-bold">{metrics.mae}</p>
                                </div>
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                    <p className="text-xs text-muted-foreground">RMSE</p>
                                    <p className="text-xl font-bold">{metrics.rmse}</p>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="w-3 h-3" /> Based on historical fit
                            </div>
                        </div>
                    )}

                    {/* Feature Importance */}
                    {featureImportance.length > 0 && (
                        <div className="bg-card border border-border rounded-xl p-5 flex-1">
                            <div className="flex items-center gap-2 font-semibold mb-4">
                                <TrendingUp className="w-4 h-4" /> Feature Importance
                            </div>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={featureImportance} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="feature" type="category" width={130} tick={{ fontSize: 10 }} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                                            {featureImportance.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.feature.includes('AQI') ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Chart Column */}
                <div className="col-span-9 flex flex-col gap-6">
                    <div className="bg-card border border-border rounded-xl p-5 flex-1 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-lg">Forecast Analysis</h3>
                            {forecastData?.summary?.explanation && (
                                <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    {forecastData.summary.explanation}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            {(!forecastData?.predictions || forecastData.predictions.length === 0) ? (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    <p>No forecast data available. Adjust parameters and fetch forecast.</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={forecastData.predictions.map((item: any) => ({
                                        date: item.date || item.ds || '',
                                        predicted: item.predicted || item.yhat || 0,
                                        baseline: item.baseline || item.y || 0,
                                        confidence_low: item.confidence_low || item.yhat_lower || 0,
                                        confidence_high: item.confidence_high || item.yhat_upper || 0
                                    }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="hsl(var(--muted-foreground))"
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        />
                                        <Legend />

                                        <Line
                                            type="monotone"
                                            dataKey="baseline"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeDasharray="5 5"
                                            dot={false}
                                            name="Baseline"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="predicted"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6 }}
                                            name="Forecast"
                                        />
                                        {/* Confidence Interval Lines */}
                                        <Line type="monotone" dataKey="confidence_high" stroke="hsl(var(--primary))" strokeOpacity={0.3} dot={false} strokeDasharray="3 3" name="Upper Bound" />
                                        <Line type="monotone" dataKey="confidence_low" stroke="hsl(var(--primary))" strokeOpacity={0.3} dot={false} strokeDasharray="3 3" name="Lower Bound" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Surge Summary */}
                    {forecastData?.summary && (
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-full text-primary">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Peak Admissions</p>
                                    <p className="text-2xl font-bold">{forecastData.summary.peak_value}</p>
                                    <p className="text-xs text-muted-foreground">on {new Date(forecastData.summary.peak_day).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className="p-3 bg-secondary/50 rounded-full text-foreground">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Daily</p>
                                    <p className="text-2xl font-bold">{forecastData.summary.avg_predicted_admissions}</p>
                                    <p className="text-xs text-muted-foreground">vs {forecastData.summary.avg_baseline_admissions} baseline</p>
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                                <div className={`p-3 rounded-full ${aqi > 200 ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Risk Factor</p>
                                    <p className="text-2xl font-bold">{aqi > 200 ? 'High' : aqi > 100 ? 'Moderate' : 'Low'}</p>
                                    <p className="text-xs text-muted-foreground">AQI Impact</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Scenario Comparison Table */}
                    {forecastData?.summary && (
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="font-semibold text-lg mb-4">Scenario Comparison</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Metric</th>
                                            <th className="px-4 py-3">Baseline (Seasonal)</th>
                                            <th className="px-4 py-3">Current Simulation</th>
                                            <th className="px-4 py-3 rounded-r-lg">Impact</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        <tr className="bg-background">
                                            <td className="px-4 py-3 font-medium">Average Daily Admissions</td>
                                            <td className="px-4 py-3">{forecastData.summary.avg_baseline_admissions}</td>
                                            <td className="px-4 py-3 font-bold">{forecastData.summary.avg_predicted_admissions}</td>
                                            <td className={`px-4 py-3 ${forecastData.summary.avg_predicted_admissions > forecastData.summary.avg_baseline_admissions ? 'text-destructive' : 'text-green-500'}`}>
                                                {((forecastData.summary.avg_predicted_admissions - forecastData.summary.avg_baseline_admissions) / forecastData.summary.avg_baseline_admissions * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                        <tr className="bg-background">
                                            <td className="px-4 py-3 font-medium">Peak Volume</td>
                                            <td className="px-4 py-3">{(forecastData.summary.avg_baseline_admissions * 1.2).toFixed(1)} (Est.)</td>
                                            <td className="px-4 py-3 font-bold">{forecastData.summary.peak_value}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {forecastData.summary.peak_value > forecastData.summary.avg_baseline_admissions * 1.2 ? 'Surge Detected' : 'Normal'}
                                            </td>
                                        </tr>
                                        <tr className="bg-background">
                                            <td className="px-4 py-3 font-medium">AQI Level</td>
                                            <td className="px-4 py-3">100 (Avg)</td>
                                            <td className="px-4 py-3 font-bold">{aqi}</td>
                                            <td className={`px-4 py-3 ${aqi > 150 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                {aqi > 150 ? 'Critical Driver' : 'Neutral'}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
