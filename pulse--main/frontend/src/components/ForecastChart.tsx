import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import type { ForecastPoint } from '../types/forecast';

interface ForecastChartProps {
    data: ForecastPoint[];
}

export function ForecastChart({ data }: ForecastChartProps) {
    // Ensure data is properly formatted
    const chartData = Array.isArray(data) ? data.map((item) => ({
        date: item.date || item.ds || '',
        predicted: item.predicted || item.yhat || 0,
        baseline: item.baseline || item.y || 0,
        confidence_low: item.confidence_low || item.yhat_lower || 0,
        confidence_high: item.confidence_high || item.yhat_upper || 0
    })) : [];

    if (chartData.length === 0) {
        return (
            <motion.div 
                className="bg-card border border-border rounded-xl p-5 h-[400px] flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <motion.p 
                    className="text-muted-foreground"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    No forecast data available. Please adjust your parameters and try again.
                </motion.p>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="bg-card border border-border rounded-xl p-5 h-[400px] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
            <motion.div 
                className="flex items-center justify-between mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="font-semibold text-lg">Admissions Forecast</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Predicted</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary/20" />
                        <span>Confidence Interval</span>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={chartData.length}
                    className="flex-1 w-full min-h-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                try {
                                    return new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                } catch {
                                    return value;
                                }
                            }}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                            labelFormatter={(label) => {
                                try {
                                    return new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                } catch {
                                    return label;
                                }
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="baseline"
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Baseline"
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                            activeDot={{ r: 6 }}
                            name="Forecast"
                        />
                        {/* Uncertainty Band */}
                        <Line type="monotone" dataKey="confidence_high" stroke="hsl(var(--primary))" strokeOpacity={0.3} dot={false} strokeDasharray="3 3" name="Upper Bound" />
                        <Line type="monotone" dataKey="confidence_low" stroke="hsl(var(--primary))" strokeOpacity={0.3} dot={false} strokeDasharray="3 3" name="Lower Bound" />
                    </LineChart>
                </ResponsiveContainer>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
