import { useTranslation } from 'react-i18next';

export default function InsightCard({ type, icon, title, body, action }) {
    const { t } = useTranslation();
    const typeClass = type === 'warning' ? 'insight-warning' : type === 'prediction' ? 'insight-prediction' : type === 'action' ? 'insight-action' : 'insight-highlight';
    return (
        <div className={`insight-card ${typeClass}`}>
            <div className="insight-icon">{icon}</div>
            <div className="insight-body">
                <div className="insight-title">{t(title)}</div>
                <div className="insight-text">{t(body)}</div>
            </div>
            {action && <button className="btn btn-sm btn-secondary insight-action-btn">{t(action)}</button>}
        </div>
    );
}
