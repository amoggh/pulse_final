import { Home, Activity, Settings, MessageSquare, BarChart2, Users, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'forecast', label: 'Forecast Lab', icon: Activity },
        { id: 'scenarios', label: 'Scenario Sandbox', icon: BarChart2 },
        { id: 'resources', label: 'Resource Planner', icon: Users },
        { id: 'chat', label: 'Ask Pulse', icon: MessageSquare },
        { id: 'alerts', label: 'Alerts & Incidents', icon: AlertTriangle },
        { id: 'admin', label: 'Admin', icon: Settings },
    ];

    return (
        <div className="h-screen w-64 bg-card border-r border-border flex flex-col">
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Pulse</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                activeTab === item.id
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                        AD
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">Admin User</p>
                        <p className="text-xs text-muted-foreground">Hospital Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
