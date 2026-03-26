import { useState } from 'react';
import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { useTranslation } from 'react-i18next';
import { sarvamTranslateIntent } from '../api/sarvam';

export default function TeacherDashboard() {
    const { t } = useTranslation();
    const [isListening, setIsListening] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    const insights = demoData.insights.teacher;
    const myStudents = demoData.students.filter(s => s.class_name === 'Class 10');

    const handleVoiceClick = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setToastMessage("Speech Recognition not supported in this browser.");
            setTimeout(() => setToastMessage(null), 3000);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN'; // Default to Hindi as per Sarvam AI use-case
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setToastMessage("Listening... Speak in Hindi/English (e.g., 'Mark Aarav absent')");
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setToastMessage(`Processing: "${transcript}"...`);

            const result = await sarvamTranslateIntent(transcript);

            if (result.intent === 'MARK_ATTENDANCE') {
                setToastMessage(`✅ Marked ${result.entities.join(', ')} as absent.`);
            } else if (result.intent === 'CREATE_ASSIGNMENT') {
                setToastMessage(`✅ Action: Remind students about ${result.entities.join(', ')}`);
            } else {
                setToastMessage(`🤷 Intent not recognized for: "${transcript}"`);
            }
            setIsListening(false);
            setTimeout(() => setToastMessage(null), 5000);
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error !== 'no-speech') {
                setToastMessage(`Microphone error: ${event.error}`);
                setTimeout(() => setToastMessage(null), 3000);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };
    return (
        <div className="page-content">
            <div className="page-header"><div><h2>👨‍🏫 {t("My Classroom")}</h2><p>{t("Class 10 — Dr. Rajesh Kumar")}</p></div></div>

            <div className="section-label">🧠 {t("AI Insights for You")}</div>
            <div className="insights-grid">
                {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon blue">🎓</div><div className="stat-info"><span className="stat-label">{t("My Students")}</span><span className="stat-value">{myStudents.length}</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">📋</div><div className="stat-info"><span className="stat-label">{t("Today's Attendance")}</span><span className="stat-value">89%</span></div></div>
                <div className="card stat-card"><div className="stat-icon purple">📝</div><div className="stat-info"><span className="stat-label">{t("Homework Due")}</span><span className="stat-value">2</span></div></div>
                <div className="card stat-card"><div className="stat-icon yellow">⭐</div><div className="stat-info"><span className="stat-label">{t("Class Avg")}</span><span className="stat-value">82%</span></div></div>
            </div>

            <div className="card table-card" style={{ marginBottom: 20 }}>
                <h3>📅 {t("Today's Schedule")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Period")}</th><th>{t("Time")}</th><th>{t("Class")}</th><th>{t("Status")}</th></tr></thead>
                    <tbody>
                        {[{ p: 1, time: '8:00–8:45', cls: 'Class 10A', s: 'completed' }, { p: 3, time: '9:45–10:30', cls: 'Class 9B', s: 'current' }, { p: 5, time: '11:30–12:15', cls: 'Class 10B', s: 'upcoming' }].map(item => (
                            <tr key={item.p} style={item.s === 'current' ? { background: 'rgba(59,130,246,0.08)' } : {}}>
                                <td>{item.p}</td><td>{item.time}</td><td className="name-cell">{item.cls}</td>
                                <td><span className={`badge ${item.s === 'completed' ? 'active' : item.s === 'current' ? 'info' : 'pending'}`}>{item.s === 'current' ? t('● Live Now') : t(item.s)}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card table-card">
                <h3>🎓 {t("Student Performance — Class 10")}</h3>
                <table className="data-table">
                    <thead><tr><th>{t("Student")}</th><th>{t("Attendance")}</th><th>{t("Avg Score")}</th><th>{t("Risk")}</th></tr></thead>
                    <tbody>
                        {myStudents.map(s => (
                            <tr key={s.id}><td className="name-cell">{s.first_name} {s.last_name}</td><td>{s.attendance}%</td><td>{s.avgScore}%</td>
                                <td><span className={`badge ${s.risk === 'low' ? 'active' : s.risk === 'medium' ? 'pending' : 'absent'}`}>{t(s.risk === 'low' ? 'Low Risk' : s.risk === 'medium' ? 'Medium Risk' : 'High Risk')}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card table-card" style={{ marginBottom: 20 }}>
                <h3>🔥 {t("Engagement Velocity & Holistic Progress — Class 10")}</h3>
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {t("AI Alert: Rohan Gupta’s engagement velocity dropped 40% this week. He is active in Social quests but ignoring Cognitive ones. Recommend a 1-on-1 check-in.")}
                </div>
                <table className="data-table">
                    <thead><tr><th>{t("Student")}</th><th>{t("Cognitive")}</th><th>{t("Creative")}</th><th>{t("Physical")}</th><th>{t("EQ")}</th><th>{t("Velocity Trend")}</th></tr></thead>
                    <tbody>
                        <tr><td className="name-cell">Aarav Sharma</td><td>Level 12</td><td>Level 8</td><td>Level 4 ⚠️</td><td>Level 7</td><td><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>↑ +12%</span></td></tr>
                        <tr><td className="name-cell">Priya Patel</td><td>Level 5 ⚠️</td><td>Level 9</td><td>Level 11</td><td>Level 10</td><td><span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>→ Steady</span></td></tr>
                        <tr><td className="name-cell">Rohan Gupta</td><td>Level 3 ⚠️</td><td>Level 4</td><td>Level 15</td><td>Level 14</td><td><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>↓ -40%</span></td></tr>
                        <tr><td className="name-cell">Ananya Singh</td><td>Level 14</td><td>Level 12</td><td>Level 10</td><td>Level 11</td><td><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>↑ +5%</span></td></tr>
                    </tbody>
                </table>
            </div>

            {toastMessage && (
                <div style={{
                    position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '12px 24px',
                    borderRadius: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000,
                    border: '1px solid var(--border)', fontWeight: 500, fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 8
                }}>
                    🎙️ {toastMessage}
                </div>
            )}

            <button
                onClick={handleVoiceClick}
                className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                style={{
                    position: 'fixed', bottom: 24, right: 24, width: 64, height: 64,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.6)' : '0 4px 12px rgba(59,130,246,0.3)',
                    zIndex: 999, transition: 'all 0.3s ease'
                }}
            >
                {isListening ? '🛑' : '🎤'}
            </button>
        </div>
    );
}
