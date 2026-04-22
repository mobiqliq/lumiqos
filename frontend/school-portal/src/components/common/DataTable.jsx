import s from './DataTable.module.css';

export default function DataTable({ columns, rows, loading, empty = 'No data' }) {
  if (loading) return <div className={s.state}>Loading…</div>;
  if (!rows?.length) return <div className={s.state}>{empty}</div>;

  return (
    <div className={s.wrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={s.th} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className={s.tr}>
              {columns.map(col => (
                <td key={col.key} className={s.td}>
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
