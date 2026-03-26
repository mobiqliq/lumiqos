import { useState } from 'react';
import InsightCard from '../components/InsightCard';

export default function Procurement() {
    const [items] = useState([
        { id: 1, name: 'A4 Printer Paper', category: 'Stationery', stock: 12, unit: 'Boxes', usageRate: '4 Boxes/Week', runOut: '14 Days', status: 'Warning', vendor: 'OfficeSupplies Co.' },
        { id: 2, name: 'Whiteboard Markers', category: 'Stationery', stock: 45, unit: 'Packs', usageRate: '5 Packs/Week', runOut: '63 Days', status: 'Healthy', statusColor: 'var(--success)' },
        { id: 3, name: 'Science Lab Chemicals (Kit B)', category: 'Lab', stock: 2, unit: 'Kits', usageRate: '1 Kit/Month', runOut: '60 Days', status: 'Healthy', statusColor: 'var(--success)' },
        { id: 4, name: 'Printer Ink Cartridges (Black)', category: 'IT', stock: 1, unit: 'Units', usageRate: '2 Units/Month', runOut: '15 Days', status: 'Critical', statusColor: 'var(--danger)' },
        { id: 5, name: 'Sports Equipment (Footballs)', category: 'Sports', stock: 8, unit: 'Items', usageRate: 'Replacement/Term', runOut: '90+ Days', status: 'Healthy', statusColor: 'var(--success)' },
    ]);

    const [processing, setProcessing] = useState(false);
    const [ordered, setOrdered] = useState([]);

    const handleReorder = (id) => {
        setProcessing(true);
        setTimeout(() => {
            setOrdered(prev => [...prev, id]);
            setProcessing(false);
        }, 1500);
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: 24 }}>
                <div>
                    <h2>📦 Smart Inventory & Procurement</h2>
                    <p>AI predicts when you will run out of critical supplies before it happens.</p>
                </div>
            </div>

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr', alignItems: 'start' }}>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 8 }}>
                    <InsightCard
                        type="prediction"
                        icon="📈"
                        title="AI Run-Out Prediction"
                        body="A4 Paper usage increased by 20% due to upcoming Mid-Terms. Current stock of 12 boxes will deplete in 14 days (before exams end)."
                        action={ordered.includes(1) ? "Ordered" : "Auto-Reorder Now"}
                        onAction={() => handleReorder(1)}
                    />
                    <InsightCard
                        type="warning"
                        icon="⚠️"
                        title="Critical IT Alert"
                        body="Only 1 Black Ink Cartridge remaining. Average consumption is 2/month. Delivery lead time is 5 days."
                        action={ordered.includes(4) ? "Ordered" : "Auto-Reorder Now"}
                        onAction={() => handleReorder(4)}
                    />
                    <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Monthly Budget Used</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹45,000 / ₹60,000</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 16 }}>
                            <div style={{ width: '75%', height: '100%', background: 'var(--warning)', borderRadius: 4 }} />
                        </div>
                        <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }}>View Pending Approvals (2)</button>
                    </div>
                </div>

                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ margin: 0 }}>Current Inventory run-rates</h3>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <select className="form-input" style={{ width: 'auto', padding: '6px 12px' }}>
                                <option>All Categories</option>
                                <option>Stationery</option>
                                <option>IT Assets</option>
                                <option>Lab</option>
                            </select>
                            <button className="btn btn-primary">Add Item +</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Current Stock</th>
                                    <th>Usage Rate</th>
                                    <th>AI Reorder Prediction</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td><span className="badge" style={{ background: 'var(--bg-secondary)' }}>{item.category}</span></td>
                                        <td><strong style={{ fontSize: 15 }}>{item.stock}</strong> <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.unit}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{item.usageRate}</td>
                                        <td style={{ fontWeight: 600, color: item.status === 'Critical' ? 'var(--danger)' : item.status === 'Warning' ? 'var(--warning)' : 'var(--text-primary)' }}>{item.runOut}</td>
                                        <td><span className="badge" style={{ background: item.statusColor || (item.status === 'Critical' ? 'var(--danger)' : 'var(--warning)'), color: 'white' }}>{item.status}</span></td>
                                        <td>
                                            {ordered.includes(item.id) ? (
                                                <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>✓ Reordered</span>
                                            ) : (
                                                <button
                                                    className={`btn btn-sm ${item.status === 'Healthy' ? 'btn-secondary' : 'btn-primary'}`}
                                                    disabled={processing}
                                                    onClick={() => handleReorder(item.id)}
                                                    style={item.status === 'Healthy' ? { opacity: 0.5 } : {}}
                                                >
                                                    {processing ? '...' : 'Reorder'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
