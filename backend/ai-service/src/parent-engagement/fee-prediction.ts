import { FeeInvoice } from '@lumiqos/shared/index';

export class FeePredictionGenerator {
    static analyze(invoices: FeeInvoice[]): any {
        let overdueCount = 0;
        let imminentDueDate: Date | null = null;

        const now = new Date();

        for (const inv of invoices) {
            if (inv.status === 'overdue') overdueCount++;
            else if (inv.status === 'paid' || inv.status === 'cancelled') continue;
            else {
                // It's 'issued' or pending essentially. Find earliest forthcoming.
                const due = new Date(inv.due_date);
                if (due > now) {
                    if (!imminentDueDate || due < imminentDueDate) imminentDueDate = due;
                }
            }
        }

        let risk = 'low';
        let rec = 'Accounts are clear. Pay future invoices normally.';

        if (overdueCount > 2) {
            risk = 'high';
            rec = 'Immediate attention required. Please clear overdue balances immediately neutralizing suspension risks.';
        } else if (overdueCount > 0) {
            risk = 'medium';
            rec = 'Please clear out the pending overdue invoice mitigating late penalty escalations.';
        } else if (imminentDueDate) {
            const diffTime = Math.abs(imminentDueDate.getTime() - now.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) {
                rec = \`Pay within \${diffDays} days explicitly anticipating no late penalties.\`;
             }
        }

        return {
             next_due_date: imminentDueDate ? imminentDueDate.toISOString().split('T')[0] : 'None',
             risk_level: risk,
             ai_recommendation: rec
        };
    }
}
