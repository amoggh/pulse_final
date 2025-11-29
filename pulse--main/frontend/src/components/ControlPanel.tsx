import { motion } from 'framer-motion';

interface ControlPanelProps {
    aqi: number;
    setAqi: (val: number) => void;
    isFestival: boolean;
    setIsFestival: (val: boolean) => void;
    horizon: number;
    setHorizon: (val: number) => void;
    useSimulation: boolean;
    setUseSimulation: (val: boolean) => void;
}

export function ControlPanel({ aqi, setAqi, isFestival, setIsFestival, horizon, setHorizon, useSimulation, setUseSimulation }: ControlPanelProps) {
    return (
        <motion.div
            className="bg-card border border-border rounded-xl p-5 h-full flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        >
            <motion.h3
                className="font-semibold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                Simulation Controls
            </motion.h3>

            <div className="space-y-4">
                <motion.div
                    className="flex items-center justify-between pb-2 border-b border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <label className="text-sm font-medium">Use Simulation</label>
                    <motion.button
                        onClick={() => setUseSimulation(!useSimulation)}
                        className={`w-12 h-6 rounded-full relative ${useSimulation ? 'bg-primary' : 'bg-secondary'}`}
                        whileTap={{ scale: 0.95 }}
                        animate={{ backgroundColor: useSimulation ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                            animate={{ x: useSimulation ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    </motion.button>
                </motion.div>
                <p className="text-xs text-muted-foreground">
                    {useSimulation ? '🎮 Using simulated values' : '📊 Using live CSV data'}
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium">AQI Override</label>
                        <span className="text-sm text-muted-foreground">{aqi}</span>
                    </div>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        value={aqi}
                        onChange={(e) => setAqi(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Good (50)</span>
                        <span>Hazardous (500)</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium">Forecast Horizon</label>
                        <span className="text-sm text-muted-foreground">{horizon} Days</span>
                    </div>
                    <input
                        type="range"
                        min="3"
                        max="30"
                        value={horizon}
                        onChange={(e) => setHorizon(Number(e.target.value))}
                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>

                <motion.div
                    className="flex items-center justify-between pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <label className="text-sm font-medium">Festival Mode</label>
                    <motion.button
                        onClick={() => setIsFestival(!isFestival)}
                        className={`w-12 h-6 rounded-full relative ${isFestival ? 'bg-primary' : 'bg-secondary'}`}
                        whileTap={{ scale: 0.95 }}
                        animate={{ backgroundColor: isFestival ? 'hsl(var(--primary))' : 'hsl(var(--secondary))' }}
                    >
                        <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                            animate={{ x: isFestival ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                    </motion.button>
                </motion.div>

                <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium block mb-2">Department</label>
                    <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>All Departments</option>
                        <option>Respiratory</option>
                        <option>Trauma / ER</option>
                        <option>Pediatrics</option>
                    </select>
                </div>
            </div>
        </motion.div>
    );
}
