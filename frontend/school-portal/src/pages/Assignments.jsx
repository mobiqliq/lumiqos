import { useState } from 'react';
import InsightCard from '../components/InsightCard';
import { useTranslation } from 'react-i18next';

const INITIAL_ASSIGNMENTS = [
    { id: 1, subject: 'Mathematics', title: 'Algebra Worksheet 4', dueDate: 'Today', status: 'pending', grade: null, teacher: 'Mrs. Sharma' },
    { id: 2, subject: 'Science', title: 'Physics Lab Report', dueDate: 'Tomorrow', status: 'pending', grade: null, teacher: 'Mr. Verma' },
    { id: 3, subject: 'English', title: 'Essay on Climate Change', dueDate: 'Oct 15', status: 'submitted', grade: 'A-', teacher: 'Ms. Gupta' },
    { id: 4, subject: 'Social Studies', title: 'History Map Work', dueDate: 'Oct 10', status: 'overdue', grade: null, teacher: 'Mr. Singh' },
    { id: 5, subject: 'Mathematics', title: 'Geometry Quiz Prep', dueDate: 'Oct 5', status: 'submitted', grade: 'B+', teacher: 'Mrs. Sharma' },
];

export default function Assignments() {
    const { t } = useTranslation();
    const role = localStorage.getItem('school_role') || 'parent';
    const isParent = role === 'parent';
    const isTeacher = role === 'teacher';

    const [filter, setFilter] = useState('all');
    const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSubject, setNewSubject] = useState('Mathematics');
    const [newDueDate, setNewDueDate] = useState('');

    const filteredAssignments = assignments.filter(a => {
        if (filter === 'all') return true;
        return a.status === filter;
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const newAssignment = {
            id: assignments.length + 1,
            subject: newSubject,
            title: newTitle,
            dueDate: newDueDate || 'Tomorrow',
            status: 'pending',
            grade: null,
            teacher: 'You',
        };
        setAssignments([newAssignment, ...assignments]);
        setIsCreating(false);
        setNewTitle('');
    };

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h2>📝 {isParent ? t("Child's Assignments") : t("Homework Management")}</h2>
                    <p>{isParent ? t("Track submissions, grades, and insights for Aarav") : t("Manage assignments for your classes")}</p>
                </div>
                {isTeacher && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>+ {t("Create Assignment")}</button>
                )}
            </div>

            {isCreating && (
                <div style={{ marginBottom: 24, padding: 24, background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <h3 style={{ marginBottom: 16 }}>{t("Assign New Homework")}</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t("Subject")}</label>
                            <select className="form-input" style={{ appearance: 'auto' }} value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                                <option>{t("Mathematics")}</option>
                                <option>{t("Science")}</option>
                                <option>{t("English")}</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t("Assignment Title")}</label>
                            <input className="form-input" required placeholder={t("e.g. Chapter 4 Exercises")} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{t("Due Date")}</label>
                            <input className="form-input" type="date" required value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>{t("Cancel")}</button>
                            <button type="submit" className="btn btn-primary">{t("Assign")}</button>
                        </div>
                    </form>
                </div>
            )}

            {isParent && (
                <div style={{ marginBottom: 24 }}>
                    <InsightCard
                        type="warning"
                        icon="⚠️"
                        title={t("AI Behavioral Insight")}
                        body={t("Aarav has missed 2 Mathematics assignments in the last month and currently has 1 overdue Social Studies project. Consider setting up a dedicated homework hour before dinner to build a consistent routine.")}
                        action={t("Message Teachers")}
                    />
                </div>
            )}

            <div className="charts-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3>{t("Assignment Tracker")}</h3>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>{t("All")}</button>
                            <button className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('pending')}>{t("Pending")}</button>
                            <button className={`btn btn-sm ${filter === 'submitted' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('submitted')}>{t("Submitted")}</button>
                            <button className={`btn btn-sm ${filter === 'overdue' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('overdue')}>{t("Overdue")}</button>
                        </div>
                    </div>

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t("Subject")}</th>
                                <th>{t("Assignment Name")}</th>
                                <th>{t("Due Date")}</th>
                                <th>{t("Status")}</th>
                                <th>{t("Grade/Feedback")}</th>
                                {isParent && <th>{t("Teacher")}</th>}
                                {isTeacher && <th>{t("Submissions")}</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssignments.map(a => (
                                <tr key={a.id}>
                                    <td className="name-cell">{t(a.subject)}</td>
                                    <td style={{ fontWeight: 500 }}>{t(a.title)}</td>
                                    <td>{t(a.dueDate)}</td>
                                    <td>
                                        <span className={`badge ${a.status === 'submitted' ? 'active' : a.status === 'overdue' ? 'inactive' : 'pending'}`}>
                                            {a.status === 'submitted' ? `✅ ${t("Submitted")}` : a.status === 'overdue' ? `⚠️ ${t("Overdue")}` : `⏳ ${t("Pending")}`}
                                        </span>
                                    </td>
                                    <td>{a.grade || '-'}</td>
                                    {isParent && <td>{t(a.teacher)}</td>}
                                    {isTeacher && <td>{a.status === 'submitted' ? '32/34' : '12/34'}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
