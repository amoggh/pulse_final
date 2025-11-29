import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface Alert {
    id: string;
    type: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    message: string;
    department?: string;
    timestamp: string;
    acknowledged: boolean;
}

export function AlertsIncidents() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [kpis, setKpis] = useState<any>(null);
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const defaultKpi = {
            occupancy: 87,
            admissions_24h: 42,
            aqi: 97,
            risk_score: 65
        };

        setLoading(true);
        setError(null);

        Promise.allSettled([
            fetch('http://localhost:8000/api/kpi').then(res => {
                if (!res.ok) throw new Error('KPI fetch failed');
                return res.json();
            }),
            fetch('http://localhost:8000/api/inventory').then(res => {
                if (!res.ok) throw new Error('Inventory fetch failed');
                return res.json();
            }),
            fetch('http://localhost:8000/api/decision/evaluate').then(res => {
                if (!res.ok) throw new Error('Decision fetch failed');
                return res.json();
            })
        ]).then(results => {
            const [kpiResult, inventoryResult, decisionResult] = results;

            if (kpiResult.status === 'fulfilled') {
                setKpis(kpiResult.value);
            } else {
                setKpis(defaultKpi);
                setError("Live KPIs unavailable. Showing last known values.");
            }

            if (inventoryResult.status === 'fulfilled') {
                setInventory(inventoryResult.value);
            } else {
                setInventory([]);
                setError(prev => prev ? prev : "Inventory data unavailable.");
            }

            if (decisionResult.status === 'fulfilled') {
                const mapToAlert = (item: any, category: string): Alert => ({
                    id: `alert_${Math.random().toString(36).substr(2, 9)}`,
                    type: item.priority === 'High' ? 'critical' : item.priority === 'Medium' ? 'medium' : 'low',
                    category: category,
                    message: item.action,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                });

                const recAlerts: Alert[] = [
                    ...(decisionResult.value.actions?.staffing || []).map((i: any) => mapToAlert(i, 'Staffing')),
                    ...(decisionResult.value.actions?.supplies || []).map((i: any) => mapToAlert(i, 'Supplies')),
                    ...(decisionResult.value.actions?.bed_management || []).map((i: any) => mapToAlert(i, 'Bed Mgmt')),
                    ...(decisionResult.value.actions?.advisory || []).map((i: any) => mapToAlert(i, 'Advisory'))
                ];

                setAlerts(prev => [...prev, ...recAlerts]);
            } else {
                setError(prev => prev ? prev : "Decision engine unavailable.");
            }
        }).catch(err => {
            console.error("Failed to load alerts context", err);
            setError("Unable to load latest alerts. Showing cached thresholds.");
            setKpis(defaultKpi);
        }).finally(() => setLoading(false));
    }, []);

    // Generate alerts based on KPIs and inventory
    useEffect(() => {
        const newAlerts: Alert[] = [];

        if (kpis) {
            // High occupancy alert
            if (kpis.occupancy > 85) {
                newAlerts.push({
                    id: 'occ_high',
                    type: 'high',
                    category: 'Capacity',
                    message: `Hospital occupancy at ${kpis.occupancy}% - approaching capacity limit`,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                });
            }

            // High AQI alert
            if (kpis.aqi > 200) {
                newAlerts.push({
                    id: 'aqi_high',
                    type: kpis.aqi > 250 ? 'critical' : 'high',
                    category: 'Environmental',
                    message: `Air Quality Index at ${kpis.aqi} - expect increased respiratory admissions`,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                });
            }

            // High risk score alert
            if (kpis.risk_score > 80) {
                newAlerts.push({
                    id: 'risk_high',
                    type: 'high',
                    category: 'Operational Risk',
                    message: `Operational risk score at ${kpis.risk_score}/100 - multiple risk factors present`,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                });
            }
        }

        // Low inventory alerts
        inventory.forEach(item => {
            if (item.current_stock < item.minimum_stock) {
                newAlerts.push({
                    id: `inv_${item.item_id}`,
                    type: item.current_stock < item.minimum_stock * 0.5 ? 'critical' : 'medium',
                    category: 'Inventory',
                    message: `${item.item_name} stock low: ${item.current_stock} ${item.unit} (min: ${item.minimum_stock})`,
                    department: item.category,
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                });
            }
        });

        // Merge with existing alerts (avoid duplicates)
        setAlerts(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNew = newAlerts.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNew];
        });
    }, [kpis, inventory]);

    const acknowledgeAlert = (id: string) => {
        setAlerts(prev => prev.map(alert =>
            alert.id === id ? { ...alert, acknowledged: true } : alert
        ));
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return <AlertTriangle className="w-5 h-5 text-destructive" />;
            case 'high': return <AlertCircle className="w-5 h-5 text-warning" />;
            case 'medium': return <Info className="w-5 h-5 text-primary" />;
            default: return <CheckCircle className="w-5 h-5 text-success" />;
        }
    };

    const getAlertBgClass = (type: string) => {
        switch (type) {
            case 'critical': return 'bg-destructive/10 border-destructive/20';
            case 'high': return 'bg-warning/10 border-warning/20';
            case 'medium': return 'bg-primary/10 border-primary/20';
            default: return 'bg-success/10 border-success/20';
        }
    };

    const activeAlerts = alerts.filter(a => !a.acknowledged);
    const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

    const criticalCount = activeAlerts.filter(a => a.type === 'critical').length;
    const highCount = activeAlerts.filter(a => a.type === 'high').length;
    const mediumCount = activeAlerts.filter(a => a.type === 'medium').length;

    if (loading) {
        return (
            <div className="p-6 h-full flex flex-col gap-4 items-center justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p>Loading alerts and incidents...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 h-full flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-bold">Alerts & Incidents</h1>
                <p className="text-muted-foreground">Real-time monitoring and incident management</p>
                {error && (
                    <div className="mt-2 text-xs text-warning flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Active Alerts</p>
                            <p className="text-2xl font-bold">{activeAlerts.length}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <div className="bg-card rounded-lg border border-destructive/20 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Critical</p>
                            <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                        </div>
                        <AlertTriangle className="w-8 h-8 text-destructive" />
                    </div>
                </div>
                <div className="bg-card rounded-lg border border-warning/20 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">High Priority</p>
                            <p className="text-2xl font-bold text-warning">{highCount}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-warning" />
                    </div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Medium</p>
                            <p className="text-2xl font-bold">{mediumCount}</p>
                        </div>
                        <Info className="w-8 h-8 text-primary" />
                    </div>
                </div>
            </div>

            {/* Active Alerts */}
            <div className="flex-1 overflow-auto space-y-4">
                <h2 className="text-xl font-semibold">Active Alerts</h2>
                {activeAlerts.length === 0 ? (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                        <p className="text-success font-semibold">All Clear</p>
                        <p className="text-muted-foreground text-sm">No active alerts at this time</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.sort((a, b) => {
                            const priority = { critical: 0, high: 1, medium: 2, low: 3 };
                            return priority[a.type as keyof typeof priority] - priority[b.type as keyof typeof priority];
                        }).map(alert => (
                            <div key={alert.id} className={`border rounded-lg p-4 ${getAlertBgClass(alert.type)}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        {getAlertIcon(alert.type)}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{alert.category}</span>
                                                {alert.department && (
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{alert.department}</span>
                                                )}
                                            </div>
                                            <p className="text-sm">{alert.message}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => acknowledgeAlert(alert.id)}
                                        className="px-3 py-1 text-sm bg-background hover:bg-muted rounded border border-border transition-colors"
                                    >
                                        Acknowledge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Acknowledged Alerts */}
                {acknowledgedAlerts.length > 0 && (
                    <>
                        <h2 className="text-xl font-semibold mt-8">Acknowledged Alerts</h2>
                        <div className="space-y-2">
                            {acknowledgedAlerts.slice(0, 5).map(alert => (
                                <div key={alert.id} className="bg-muted/50 border border-border rounded-lg p-3 opacity-60">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-success" />
                                        <span className="text-sm font-medium">{alert.category}:</span>
                                        <span className="text-sm text-muted-foreground">{alert.message}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
