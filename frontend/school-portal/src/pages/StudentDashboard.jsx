import { useState } from 'react';
import { demoData } from '../api/client';
import InsightCard from '../components/InsightCard';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function StudentDashboard() {
    const { t } = useTranslation();
    const [isProMode, setIsProMode] = useState(false);

    // Auto-enable Pro Mode for Class 9+ in a real scenario
    const handleToggleProMode = () => setIsProMode(!isProMode);
    const aiMessage = {
        title: `🤖 ${t("Personal AI Tutor")}`,
        body: t("Hey Aarav! I noticed you struggled with 'Quadratic Equations' in yesterday's homework. Let's play a 5-minute math minigame to clear the concepts and earn 50 XP!")
    };

    // Use real data from demoData if available (assuming first student for the demo)
    const student = demoData?.students?.[0] || {
        first_name: 'Aarav',
        xp: 1800,
        level: 12,
        streak_days: 14,
        skill_tree: { cognitive: 85, creative: 70, physical: 45, social: 60, life_skills: 50 }
    };

    const skillData = [
        { subject: t('Cognitive'), A: student.skill_tree?.cognitive || 85, fullMark: 100 },
        { subject: t('Creative'), A: student.skill_tree?.creative || 70, fullMark: 100 },
        { subject: t('Physical'), A: student.skill_tree?.physical || 45, fullMark: 100 },
        { subject: t('EQ (Social)'), A: student.skill_tree?.social || 60, fullMark: 100 },
        { subject: t('Life Skills'), A: student.skill_tree?.life_skills || 50, fullMark: 100 },
    ];

    return (
        <div className="page-content" style={isProMode ? { backgroundColor: '#0f172a', color: '#f8fafc', transition: 'all 0.3s ease', minHeight: '100vh', padding: '24px', borderRadius: '8px' } : {}}>
            <div className="page-header" style={{ marginBottom: 16, borderBottom: isProMode ? '1px solid #334155' : 'none', paddingBottom: isProMode ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                        <h2 style={isProMode ? { color: '#f8fafc' } : {}}>🚀 {t("My Universe")}</h2>
                        <p style={isProMode ? { color: '#94a3b8' } : {}}>{t("Welcome back")}, {student.first_name}! {t("Ready for today's quests?")}</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div className="toggle-switch" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={handleToggleProMode}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isProMode ? '#38bdf8' : 'var(--text-muted)' }}>{t("Pro Mode (Teens)")}</span>
                        <div style={{ width: 40, height: 20, background: isProMode ? '#38bdf8' : 'var(--border)', borderRadius: 10, position: 'relative' }}>
                            <div style={{ width: 16, height: 16, background: 'white', borderRadius: '50%', position: 'absolute', top: 2, left: isProMode ? 22 : 2, transition: 'all 0.2s' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: isProMode ? '#38bdf8' : 'var(--accent)', textShadow: isProMode ? '0 0 10px rgba(56, 189, 248, 0.4)' : '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                            {isProMode ? t("Master Scholar") : `${t("Level")} ${student.level} ${t("Scholar")}`}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <div style={{ flex: 1, height: 6, background: isProMode ? '#1e293b' : 'var(--bg-secondary)', borderRadius: 3, width: 120 }}>
                                <div style={{ width: '75%', height: '100%', background: isProMode ? '#38bdf8' : 'var(--accent)', borderRadius: 3, boxShadow: isProMode ? '0 0 8px #38bdf8' : '0 0 8px var(--accent)' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isProMode ? '#94a3b8' : 'inherit' }}>{isProMode ? '1.8k / 2.4k GP' : `${student.xp}/2400 ${t("XP")}`}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isProMode ? (
                <div style={{ padding: 24, background: '#1e293b', borderRadius: 'var(--radius-md)', border: '1px solid #334155', marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: 8, fontSize: 18 }}>⚡ Productivity Hub</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Use AI tools to transform your study materials into actionable formats.</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn btn-sm btn-primary" style={{ background: '#38bdf8', color: '#0f172a', border: 'none' }}>+ AI Mind Map</button>
                            <button className="btn btn-sm btn-secondary" style={{ background: '#334155', color: '#f8fafc', border: 'none' }}>▶️ YT Summarizer</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: 16, background: 'var(--accent-glow)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ fontSize: 32, filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.5))' }}>🤖</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: 'white', marginBottom: 4 }}>{aiMessage.title}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{aiMessage.body}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '8px 24px', fontSize: 14 }}>{t("Play Game")}</button>
                </div>
            )}

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card stat-card"><div className="stat-icon purple">🔥</div><div className="stat-info"><span className="stat-label">{t("Daily Streak")}</span><span className="stat-value">{student.streak_days} {t("Days")}</span></div></div>
                <div className="card stat-card"><div className="stat-icon green">✅</div><div className="stat-info"><span className="stat-label">{t("Quests Done")}</span><span className="stat-value">42</span></div></div>
                <div className="card stat-card"><div className="stat-icon yellow">🏆</div><div className="stat-info"><span className="stat-label">{t("Badges Earned")}</span><span className="stat-value">8</span></div></div>
                <div className="card stat-card"><div className="stat-icon blue">🌟</div><div className="stat-info"><span className="stat-label">{t("Peer Rank")}</span><span className="stat-value">{t("Top 15%")}</span></div></div>
            </div>

            <div className="charts-grid">
                <div className="card" style={isProMode ? { padding: 24, background: '#1e293b', border: '1px solid #334155' } : { padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={isProMode ? { color: '#f8fafc' } : {}}>⚔️ {isProMode ? t("The Arena: Social Combat") : t("Today's Missions (Holistic XP)")}</h3>
                    </div>
                    {isProMode ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ padding: 16, background: '#0f172a', borderRadius: 'var(--radius-sm)', border: '1px solid #ec4899', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #ec4899' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#ec4899', marginBottom: 4, fontWeight: 700, letterSpacing: 1 }}>INCOMING CHALLENGE</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: '#f8fafc' }}>Priya Patel challenged you!</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Subject: Physics • 60 Sec Sprint</div>
                                </div>
                                <button className="btn btn-sm btn-primary" style={{ background: '#ec4899', color: 'white', border: 'none', boxShadow: '0 0 10px rgba(236,72,153,0.5)' }}>Accept Battle</button>
                            </div>
                            <div style={{ padding: 16, background: '#0f172a', borderRadius: 'var(--radius-sm)', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 700, letterSpacing: 1 }}>SOLO ARENA</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: '#f8fafc' }}>AI Boss Rush</div>
                                    <div style={{ fontSize: 12, color: '#38bdf8' }}>Reward: +500 Grind Points</div>
                                </div>
                                <button className="btn btn-sm btn-secondary" style={{ background: 'transparent', color: '#f8fafc', borderColor: '#334155' }}>Initiate</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Cognitive Branch Quest */}
                            <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #3b82f6' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>COGNITIVE BRANCH</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t("Physics: Validate the Theory of Gravity")}</div>
                                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>{t("Reward: +50 Cognitive XP")}</div>
                                </div>
                                <button className="btn btn-sm btn-primary">{t("Launch Mission")}</button>
                            </div>
                            {/* Creative Branch Quest */}
                            <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #8b5cf6' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>CREATIVE BRANCH</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t("Music: Compose a 16-bar Melody")}</div>
                                    <div style={{ fontSize: 12, color: '#8b5cf6' }}>{t("Reward: +40 Creative XP")}</div>
                                </div>
                                <button className="btn btn-sm btn-secondary" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: '#8b5cf6' }}>{t("Submit Audio")}</button>
                            </div>
                            {/* Life Skills Quest */}
                            <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f59e0b' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>LIFE SKILLS • HOMEWORK</div>
                                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t("Cook a Meal for Your Family")}</div>
                                    <div style={{ fontSize: 12, color: '#f59e0b' }}>{t("Reward: +100 Life Skills XP")}</div>
                                </div>
                                <button className="btn btn-sm btn-secondary" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: '#f59e0b' }}>{t("Request Parent Approval")}</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="card" style={isProMode ? { padding: 24, display: 'flex', flexDirection: 'column', background: '#1e293b', border: '1px solid #334155' } : { padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={isProMode ? { marginBottom: 16, color: '#f8fafc' } : { marginBottom: 16 }}>🌳 {t("Holistic Development Profile")}</h3>

                    <div style={{ flex: 1, minHeight: 250, width: '100%', margin: '0 auto' }}>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
                                <PolarGrid stroke={isProMode ? '#334155' : 'var(--border)'} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: isProMode ? '#94a3b8' : 'var(--text-secondary)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Aarav" dataKey="A" stroke={isProMode ? '#38bdf8' : 'var(--accent)'} fill={isProMode ? '#38bdf8' : 'var(--accent)'} fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ padding: 16, background: isProMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-sm)', border: isProMode ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--warning)', marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 18 }}>⚖️</span>
                            <div style={{ fontSize: 13, color: isProMode ? '#fbbf24' : 'var(--warning)', fontWeight: 600 }}>{t("Balance Recommendation")}</div>
                        </div>
                        <div style={{ fontSize: 13, color: isProMode ? '#cbd5e1' : 'var(--text-secondary)' }}>
                            {t("Your Physical XP is trailing behind Academics.")}
                            <br /><br />
                            {isProMode ? "Challenge someone to a Physical Sprint to earn 50 GP and balance your stats." : t("Complete the \"Yoga for Beginners\" quest this weekend to round out your profile!")}
                        </div>
                        <button className="btn btn-sm btn-secondary" style={{ marginTop: 12, width: '100%', background: isProMode ? 'transparent' : '', borderColor: isProMode ? '#fbbf24' : '', color: isProMode ? '#fbbf24' : '' }}>{isProMode ? "Initiate Challenge" : t("Accept Physical Quest (+50 XP)")}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
