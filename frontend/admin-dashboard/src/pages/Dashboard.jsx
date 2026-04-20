import KPICard from '../components/common/KPICard';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const kpiData = {
    totalSchools: { value: '48', delta: '+3 this month', deltaType: 'success' },
    activeUsers: { value: '12.4K', delta: '+18% WoW', deltaType: 'success' },
    mrr: { value: '₹42.8L', delta: '+5.2% MoM', deltaType: 'success' },
    systemHealth: { value: '99.8%', delta: 'All services operational', deltaType: 'neutral' },
  };

  const topSchools = [
    { name: 'Greenfield Academy', engagement: 94, students: 1250 },
    { name: 'Delhi Public School', engagement: 88, students: 3400 },
    { name: 'St. Xavier\'s High School', engagement: 86, students: 2100 },
    { name: 'Modern School', engagement: 82, students: 980 },
    { name: 'Sanskriti School', engagement: 79, students: 760 },
  ];

  const recentActivity = [
    { school: 'Greenfield Academy', action: 'New tenant onboarded', time: '2 hours ago' },
    { school: 'Delhi Public School', action: 'Upgraded to Premium plan', time: '5 hours ago' },
    { school: 'Ryan International', action: 'Added 3 new teachers', time: 'Yesterday' },
    { school: 'Modern School', action: 'AI usage threshold reached', time: 'Yesterday' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Platform Overview</h1>
        <p className={styles.pageSubtitle}>Monitor tenant health and system performance</p>
      </div>

      <div className={styles.kpiGrid}>
        <KPICard label="Total Schools" value={kpiData.totalSchools.value} delta={kpiData.totalSchools.delta} deltaType={kpiData.totalSchools.deltaType} />
        <KPICard label="Active Users (30d)" value={kpiData.activeUsers.value} delta={kpiData.activeUsers.delta} deltaType={kpiData.activeUsers.deltaType} />
        <KPICard label="Monthly Recurring Revenue" value={kpiData.mrr.value} delta={kpiData.mrr.delta} deltaType={kpiData.mrr.deltaType} />
        <KPICard label="System Health" value={kpiData.systemHealth.value} delta={kpiData.systemHealth.delta} deltaType={kpiData.systemHealth.deltaType} />
      </div>

      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Weekly Active Schools</h3>
          <div className={styles.barChartPlaceholder}>
            <div className={styles.mockBars}>
              {[85, 88, 92, 89, 94, 91, 95].map((value, i) => (
                <div key={i} className={styles.mockBarWrapper}>
                  <div className={styles.mockBar} style={{ height: `${value}%` }}>
                    <span className={styles.barValue}>{value}%</span>
                  </div>
                  <span className={styles.barLabel}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Top Schools by Engagement</h3>
          <div className={styles.progressList}>
            {topSchools.map((school, i) => (
              <div key={i} className={styles.progressItem}>
                <span className={styles.progressLabel}>{school.name}</span>
                <div className={styles.progressBarTrack}>
                  <div className={styles.progressBarFill} style={{ width: `${school.engagement}%` }} />
                </div>
                <span className={styles.progressValue}>{school.engagement}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.listCard}>
          <h3 className={styles.cardTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIcon}>🏫</div>
                <div className={styles.activityContent}>
                  <span className={styles.activitySchool}>{item.school}</span>
                  <span className={styles.activityAction}>{item.action}</span>
                </div>
                <span className={styles.activityTime}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.insightCard}>
          <div className={styles.aiTag}>🧠 AI Insight</div>
          <p className={styles.insightText}>
            <strong>3 schools</strong> have teacher login rates below 60% this week. Consider sending a re-engagement email.<br /><br />
            AI lesson planner usage is up <strong>+15% WoW</strong> across all tenants — highest adoption at Greenfield Academy.
          </p>
          <button className={styles.insightAction}>View detailed report →</button>
        </div>
      </div>
    </div>
  );
}
