import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';

interface KPITileProps {
    title: string;
    value: string | number;
    unit?: string;
    trend?: number;
    icon: LucideIcon;
    color?: "primary" | "destructive" | "warning" | "success";
}

export function KPITile({ title, value, unit, trend, icon: Icon, color = "primary" }: KPITileProps) {
    const colorStyles = {
        primary: "text-primary bg-primary/10",
        destructive: "text-destructive bg-destructive/10",
        warning: "text-yellow-500 bg-yellow-500/10",
        success: "text-green-500 bg-green-500/10",
    };

    // Extract numeric value for animation
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (typeof numericValue === 'number' && !isNaN(numericValue)) {
            const duration = 1000;
            const steps = 30;
            const increment = numericValue / steps;
            const stepDuration = duration / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current = Math.min(numericValue, current + increment);
                setDisplayValue(Math.round(current * 10) / 10);

                if (step >= steps) {
                    setDisplayValue(numericValue);
                    clearInterval(timer);
                }
            }, stepDuration);

            return () => clearInterval(timer);
        }
    }, [numericValue]);

    // Format the value with unit if it's a string with %, etc.
    const formattedValue = typeof value === 'string' && value.includes('%')
        ? `${displayValue}%`
        : typeof numericValue === 'number' && !isNaN(numericValue)
            ? displayValue
            : value;

    return (
        <motion.div
            className="bg-card border border-border rounded-xl p-5 flex items-start justify-between shadow-sm"
            whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
            <div>
                <motion.p
                    className="text-sm font-medium text-muted-foreground mb-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {title}
                </motion.p>
                <div className="flex items-baseline gap-1">
                    <motion.h3
                        className="text-2xl font-bold tracking-tight"
                        key={value}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {formattedValue}
                    </motion.h3>
                    {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                </div>
                {trend !== undefined && (
                    <motion.div
                        className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend > 0 ? "text-destructive" : "text-green-500")}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span>{trend > 0 ? "+" : ""}{trend}%</span>
                        <span className="text-muted-foreground">vs baseline</span>
                    </motion.div>
                )}
            </div>
            <motion.div
                className={cn("p-2 rounded-lg", colorStyles[color])}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                }}
                whileHover={{ rotate: 5, scale: 1.1 }}
            >
                <Icon className="w-5 h-5" />
            </motion.div>
        </motion.div>
    );
}
