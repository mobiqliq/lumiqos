import { demoData } from '../api/client';

export default function Fees() {
    const fees = demoData.fees;
    const totalCollected = '₹5,10,000';
    const totalPending = '₹2,41,000';
    const collectionRate = '68%';

    return (
        <div className="page-content">
            <div className="page-header">
                <div><h2>Fees & Finance</h2><p>Q4 2025-26 fee collection overview</p></div>
                <button className="btn btn-primary">💰 Collect Fee</button>
            </div>

            <div className="fee-summary">
                <div className="card fee-item"><div className="fee-label">Total Collected</div><div className="fee-amount" style={{ color: 'var(--success)' }}>{totalCollected}</div></div>
                <div className="card fee-item"><div className="fee-label">Pending</div><div className="fee-amount" style={{ color: 'var(--danger)' }}>{totalPending}</div></div>
                <div className="card fee-item"><div className="fee-label">Collection Rate</div><div className="fee-amount" style={{ color: 'var(--accent)' }}>{collectionRate}</div></div>
            </div>

            <div className="card table-card">
                <h3>Fee Records</h3>
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Class</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
                    <tbody>
                        {fees.map((f, i) => (
                            <tr key={i}>
                                <td className="name-cell">{f.student}</td>
                                <td>{f.class}</td>
                                <td>{f.amount}</td>
                                <td>{f.due}</td>
                                <td><span className={`badge ${f.status}`}>{f.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
