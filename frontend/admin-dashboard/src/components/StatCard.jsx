export default function StatCard({ icon, label, value, color = 'blue' }) {
    return (
        <div className="card stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
            </div>
        </div>
    );
}
