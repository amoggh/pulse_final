import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export interface AgentRecommendation {
    id: string;
    category: string;
    action: string;
    reasoning: string[];
    risk_score: number;
    status: string;
}

interface AgentPanelProps {
    recommendations: AgentRecommendation[];
    reasoningTrace?: string[];
}

export function AgentPanel({ recommendations, reasoningTrace }: AgentPanelProps) {
    const [approvedActions, setApprovedActions] = useState<string[]>([]);
    const [showTrace, setShowTrace] = useState(false);

    const handleApprove = async (rec: AgentRecommendation) => {
        try {
            const response = await fetch('http://localhost:8000/api/actions/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action_id: rec.id,
                    category: rec.category,
                    action: rec.action
                })
            });

            if (response.ok) {
                setApprovedActions(prev => [...prev, rec.id]);
            }
        } catch (error) {
            console.error("Failed to approve action", error);
        }
    };

    return (
        <motion.div
            className="bg-card border border-border rounded-xl p-5 h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">Agent Actions</h3>
                    {reasoningTrace && reasoningTrace.length > 0 && (
                        <button
                            onClick={() => setShowTrace(!showTrace)}
                            className="text-xs px-2 py-1 bg-secondary hover:bg-secondary/80 rounded-md transition-colors text-muted-foreground"
                        >
                            {showTrace ? "Hide Analysis" : "Show Analysis"}
                        </button>
                    )}
                </div>
                <motion.div
                    className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                >
                    <ShieldAlert className="w-3 h-3" />
                    <span>Active Monitoring</span>
                </motion.div>
            </motion.div>

            {showTrace && reasoningTrace && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 bg-secondary/30 rounded-lg p-3 text-xs text-muted-foreground border border-border overflow-hidden"
                >
                    <p className="font-semibold mb-2 text-foreground">Agent Analysis Trace:</p>
                    <ul className="space-y-1 list-disc pl-4">
                        {reasoningTrace.map((trace, i) => (
                            <li key={i}>{trace}</li>
                        ))}
                    </ul>
                </motion.div>
            )}

            <div className="space-y-4 overflow-auto pr-2">
                <AnimatePresence mode="wait">
                    {recommendations.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="text-center text-muted-foreground py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            No critical actions required.
                        </motion.div>
                    ) : (
                        recommendations.map((rec, index) => {
                            const isApproved = approvedActions.includes(rec.id);
                            return (
                                <motion.div
                                    key={rec.id}
                                    className={`border border-border rounded-lg p-4 transition-all group ${isApproved ? 'bg-success/5 border-success/20' : 'hover:bg-accent/5'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                                                rec.risk_score > 0.7 ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-500"
                                            )}>
                                                {rec.category}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Risk: {(rec.risk_score * 100).toFixed(0)}%</span>
                                        </div>
                                        {isApproved && <span className="text-xs font-bold text-success">APPROVED</span>}
                                    </div>

                                    <h4 className="font-medium text-sm mb-3">{rec.action}</h4>

                                    <div className="bg-secondary/50 rounded-md p-3 text-xs space-y-1 mb-3">
                                        <p className="font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Reasoning Trace
                                        </p>
                                        {rec.reasoning.map((r, i) => (
                                            <p key={i} className="text-muted-foreground pl-4 border-l-2 border-border relative">
                                                <span className="absolute left-0 top-1.5 w-1.5 h-px bg-border" />
                                                {r}
                                            </p>
                                        ))}
                                    </div>

                                    {!isApproved && (
                                        <button
                                            onClick={() => handleApprove(rec)}
                                            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            Approve Action <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
