import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { ScenarioSandbox } from '../components/ScenarioSandbox';
import { AgentChat } from '../components/AgentChat';
import { ResourcePlanner } from '../components/ResourcePlanner';
import { AlertsIncidents } from '../components/AlertsIncidents';
import { ForecastLab } from '../components/ForecastLab';

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-auto relative">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'scenarios' && <ScenarioSandbox />}
        {activeTab === 'chat' && <AgentChat />}
        {activeTab === 'resources' && <ResourcePlanner />}
        {activeTab === 'alerts' && <AlertsIncidents />}
        {activeTab === 'forecast' && <ForecastLab />}
        {['admin'].includes(activeTab) && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Feature coming soon...
          </div>
        )}
      </main>
    </div>
  );
}
