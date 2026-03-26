export class CommandCenterAnalyzer {

    // Calculates normalized 0-100 score weighing operational metrics
    static calculateHealthScore(snapshot: any): number {
        // Attendance (25%)
        const attendanceScore = Math.min(Math.max((snapshot.attendance_rate || 0), 0), 100);
        // Homework Completion (15%)
        const homeworkScore = Math.min(Math.max((snapshot.homework_completion_rate || 0), 0), 100);
        // Exam Performance (25%)
        const examScore = Math.min(Math.max((snapshot.average_exam_score || 0), 0), 100);

        // Fee Collection Rate (20%) - Assuming fee_collected format is a ratio or we assume 95% standard for now natively unless collection fraction mapped.
        // If we strictly look at overdue counts: let's map overdue invoices relative to student population as a proxy.
        // Assuming every student has 1 invoice/period. Ideal overdue = 0.
        const overdueRatio = snapshot.student_count > 0 ? snapshot.overdue_invoice_count / snapshot.student_count : 0;
        const feeCollectionRate = Math.max(0, 100 - (overdueRatio * 100));
        const feeScore = Math.min(Math.max(feeCollectionRate, 0), 100);

        // Teacher Workload Balance (15%) - 100 is perfect balance. Assuming 0 workload index is perfect, >35 is high.
        const workloadScore = Math.max(0, 100 - ((snapshot.teacher_workload_index || 0) * 1.5)); // 35 -> 47.5 deduction -> 52.5 score

        const healthScore =
            (attendanceScore * 0.25) +
            (homeworkScore * 0.15) +
            (examScore * 0.25) +
            (feeScore * 0.20) +
            (workloadScore * 0.15);

        return Math.floor(Math.min(Math.max(healthScore, 0), 100)); // clamp between 0 and 100
    }

    // Flags severity breaches securely
    static generateAlerts(current: any, previous: any | null): any[] {
        const alerts = [];

        // Deltas
        const attDrop = previous ? previous.attendance_rate - current.attendance_rate : 0;
        if (attDrop > 18) alerts.push({ type: "attendance_drop", severity: "high", message: \`Attendance dropped \${Math.floor(attDrop)}%\`, affected_area: "Global" });
        else if (attDrop > 10) alerts.push({ type: "attendance_drop", severity: "medium", message: \`Attendance dropped \${Math.floor(attDrop)}%\`, affected_area: "Global" });

        const overduePerc = current.student_count ? (current.overdue_invoice_count / current.student_count) * 100 : 0;
        if (overduePerc > 25) alerts.push({ type: "fee_collection_risk", severity: "high", message: \`\${Math.floor(overduePerc)}% of families hold overdue invoices\`, affected_area: "Finance" });
        else if (overduePerc > 15) alerts.push({ type: "fee_collection_risk", severity: "medium", message: \`\${Math.floor(overduePerc)}% of families hold overdue invoices\`, affected_area: "Finance" });

        const tWorkload = current.teacher_workload_index || 0;
        if (tWorkload > 45) alerts.push({ type: "teacher_burnout", severity: "high", message: "Global Teacher Workload Index critical", affected_area: "Staffing" });
        else if (tWorkload > 35) alerts.push({ type: "teacher_burnout", severity: "medium", message: "Global Teacher Workload Index high", affected_area: "Staffing" });

        // Academic Decline
        const examDrop = previous ? previous.average_exam_score - current.average_exam_score : 0;
        if (examDrop > 12) alerts.push({ type: "academic_decline", severity: "high", message: \`Average scores dropped \${Math.floor(examDrop)}%\`, affected_area: "Academics" });

        return alerts;
    }

    // Maps structured recommendations directly matching computed alerts
    static generateRecommendations(alerts: any[]): any[] {
        return alerts.map(alert => {
            if (alert.type === 'attendance_drop' && alert.severity === 'high') {
                return { recommendation_type: "attendance_intervention", action: "Initiate emergency attendance audit across major cohorts", affected_entity: "School Global", priority: "high" };
            }
            if (alert.type === 'attendance_drop' && alert.severity === 'medium') {
                return { recommendation_type: "attendance_intervention", action: "Send automated absence warnings to parent groups natively", affected_entity: "Global", priority: "medium" };
            }
            if (alert.type === 'fee_collection_risk') {
                return { recommendation_type: "fee_collection_drive", action: "Trigger bulk payment reminders mapping high-risk overdue families natively", affected_entity: "Finance", priority: alert.severity };
            }
            if (alert.type === 'teacher_burnout') {
                return { recommendation_type: "workload_rebalance", action: "Review scheduled classes and homework loads explicitly shifting capacity securely", affected_entity: "Staff", priority: alert.severity };
            }
            if (alert.type === 'academic_decline') {
                return { recommendation_type: "curriculum_review", action: "Audit term exams explicitly isolating macro failure brackets directly", affected_entity: "Academics", priority: alert.severity };
            }
            return { recommendation_type: "general_review", action: \`Review \${alert.affected_area}\`, affected_entity: alert.affected_area, priority: "medium" };
        });
    }

    static generateWeeklySummaryDeltas(current: any, previous: any | null): any {
        if (!previous) return { attendance_change: 0, homework_change: 0, revenue_change: 0, risk_student_change: 0 };
        return {
             attendance_change: current.attendance_rate - previous.attendance_rate,
             homework_change: current.homework_completion_rate - previous.homework_completion_rate,
             revenue_change: Number(current.total_fee_collected) - Number(previous.total_fee_collected),
             risk_student_change: current.risk_student_count - previous.risk_student_count
        };
    }
}
