import { useState, useEffect } from 'react';
import { Users, Package, Building2, AlertTriangle } from 'lucide-react';

interface InventoryItem {
    item_id?: string;
    item_name: string;
    category: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    unit_price_inr: number;
}

interface StaffMember {
    name: string;
    role: string;
    department: string;
    shift: string;
    days_of_week: string;
    hourly_rate_inr: number;
    status: string;
}

interface DepartmentInfo {
    department_name: string;
    total_beds: number;
    icu_beds: number;
    head_of_department: string;
    floor: string;
    contact: string;
}

export function ResourcePlanner() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [staffing, setStaffing] = useState<StaffMember[]>([]);
    const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
    const [activeView, setActiveView] = useState('inventory');

    useEffect(() => {
        // Fetch inventory
        fetch('http://localhost:8000/api/inventory')
            .then(res => res.json())
            .then((data: InventoryItem[]) => setInventory(data))
            .catch(err => console.error("Failed to fetch inventory", err));

        // Fetch staffing
        fetch('http://localhost:8000/api/staffing')
            .then(res => res.json())
            .then((data: StaffMember[]) => setStaffing(data))
            .catch(err => console.error("Failed to fetch staffing", err));

        // Fetch departments
        fetch('http://localhost:8000/api/departments')
            .then(res => res.json())
            .then((data: DepartmentInfo[]) => setDepartments(data))
            .catch(err => console.error("Failed to fetch departments", err));
    }, []);

    const lowStockItems = inventory.filter(item => item.current_stock < item.minimum_stock);

    return (
        <div className="p-6 h-full flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Resource Planner</h1>
                <p className="text-muted-foreground">Manage staffing, inventory, and department capacity</p>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setActiveView('inventory')}
                    className={`px-4 py-2 font-medium transition-colors ${activeView === 'inventory' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Package className="inline w-4 h-4 mr-2" />
                    Inventory
                </button>
                <button
                    onClick={() => setActiveView('staffing')}
                    className={`px-4 py-2 font-medium transition-colors ${activeView === 'staffing' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Users className="inline w-4 h-4 mr-2" />
                    Staffing
                </button>
                <button
                    onClick={() => setActiveView('departments')}
                    className={`px-4 py-2 font-medium transition-colors ${activeView === 'departments' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Building2 className="inline w-4 h-4 mr-2" />
                    Departments
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {activeView === 'inventory' && (
                    <div className="space-y-4">
                        {lowStockItems.length > 0 && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-destructive mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold">{lowStockItems.length} items below minimum stock</span>
                                </div>
                            </div>
                        )}

                        <div className="bg-card rounded-lg border border-border overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-3 font-semibold">Item</th>
                                        <th className="text-left p-3 font-semibold">Category</th>
                                        <th className="text-right p-3 font-semibold">Current Stock</th>
                                        <th className="text-right p-3 font-semibold">Min Stock</th>
                                        <th className="text-right p-3 font-semibold">Unit Price (₹)</th>
                                        <th className="text-left p-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map((item, idx) => {
                                        const isLow = item.current_stock < item.minimum_stock;
                                        return (
                                            <tr key={idx} className={`border-t border-border ${isLow ? 'bg-destructive/5' : ''}`}>
                                                <td className="p-3">{item.item_name}</td>
                                                <td className="p-3 text-muted-foreground">{item.category}</td>
                                                <td className="p-3 text-right">{item.current_stock} {item.unit}</td>
                                                <td className="p-3 text-right text-muted-foreground">{item.minimum_stock}</td>
                                                <td className="p-3 text-right font-mono">₹{item.unit_price_inr.toLocaleString()}</td>
                                                <td className="p-3">
                                                    {isLow ? (
                                                        <span className="text-destructive font-semibold">⚠️ Low Stock</span>
                                                    ) : (
                                                        <span className="text-success">✓ OK</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeView === 'staffing' && (
                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="text-left p-3 font-semibold">Name</th>
                                    <th className="text-left p-3 font-semibold">Role</th>
                                    <th className="text-left p-3 font-semibold">Department</th>
                                    <th className="text-left p-3 font-semibold">Shift</th>
                                    <th className="text-left p-3 font-semibold">Days</th>
                                    <th className="text-right p-3 font-semibold">Hourly Rate (₹)</th>
                                    <th className="text-left p-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffing.map((staff, idx) => (
                                    <tr key={idx} className="border-t border-border">
                                        <td className="p-3">{staff.name}</td>
                                        <td className="p-3 text-muted-foreground">{staff.role}</td>
                                        <td className="p-3">{staff.department}</td>
                                        <td className="p-3">{staff.shift}</td>
                                        <td className="p-3 text-muted-foreground text-sm">{staff.days_of_week}</td>
                                        <td className="p-3 text-right font-mono">₹{staff.hourly_rate_inr.toLocaleString()}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${staff.status === 'Active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeView === 'departments' && (
                    <div className="grid grid-cols-2 gap-4">
                        {departments.map((dept, idx) => (
                            <div key={idx} className="bg-card rounded-lg border border-border p-4">
                                <h3 className="text-lg font-semibold mb-2">{dept.department_name}</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Beds:</span>
                                        <span className="font-semibold">{dept.total_beds}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ICU Beds:</span>
                                        <span className="font-semibold">{dept.icu_beds}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Head:</span>
                                        <span>{dept.head_of_department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Floor:</span>
                                        <span>{dept.floor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Contact:</span>
                                        <span className="font-mono text-xs">{dept.contact}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
