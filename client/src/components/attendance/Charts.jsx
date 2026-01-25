import React, { useMemo } from 'react';

// Simple SVG multi-line chart grouped by month and showing percentages on Y axis
export default function Charts({ records = [], dateFrom, dateTo }) {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const { months, presentPct, absentPct, latePct } = useMemo(() => {
        const toMonthKey = (d) => {
            const dt = new Date(d);
            const y = dt.getFullYear();
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            return `${y}-${m}`; // e.g. 2026-01
        };

        const start = new Date(dateFrom);
        const end = new Date(dateTo);
        const monthsList = [];
        for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d.setMonth(d.getMonth() + 1)) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthsList.push(key);
        }

        const map = {};
        monthsList.forEach(mk => { map[mk] = { present: 0, absent: 0, late: 0, total: 0 }; });

        records.forEach(r => {
            const dt = r.Date || r.date || r.DateString || r;
            const key = toMonthKey(dt);
            if (!map[key]) map[key] = { present: 0, absent: 0, late: 0, total: 0 };
            map[key].total += 1;
            if (r.Status === 'Present') map[key].present += 1;
            else map[key].absent += 1;
            if (r.IsLate) map[key].late += 1;
        });

        const presentArr = [];
        const absentArr = [];
        const lateArr = [];
        monthsList.forEach(mk => {
            const item = map[mk] || { present: 0, absent: 0, late: 0, total: 0 };
            const t = item.total || 1; // avoid div by zero
            presentArr.push((item.present / t) * 100);
            absentArr.push((item.absent / t) * 100);
            lateArr.push((item.late / t) * 100);
        });

        return { months: monthsList, presentPct: presentArr, absentPct: absentArr, latePct: lateArr };
    }, [records, dateFrom, dateTo]);

    const width = 900;
    const height = 340;
    const padding = 48;

    const maxY = 100; // percent scale
    const xStep = (width - padding * 2) / Math.max(months.length - 1, 1);

    const buildPoints = (arr) => arr.map((v, i) => {
        const x = padding + i * xStep;
        const y = height - padding - ((v / maxY) * (height - padding * 2));
        return `${x},${y}`;
    }).join(' ');

    const presentPoints = buildPoints(presentPct);
    const absentPoints = buildPoints(absentPct);
    const latePoints = buildPoints(latePct);

    // y tick values (percentages)
    const yTicks = [0, 25, 50, 75, 100];

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="400" className="w-full">
                {/* grid lines and y labels */}
                {yTicks.map((val, idx) => {
                    const t = 1 - val / 100; // 0->top
                    const y = padding + t * (height - padding * 2);
                    return (
                        <g key={idx}>
                            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e6e6e6" strokeWidth="1" />
                            <text x={padding - 10} y={y + 4} fontSize="11" textAnchor="end" fill="#6b7280">{val}%</text>
                        </g>
                    );
                })}

                {/* axes */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" />

                {/* legend (slightly wider and moved 25px up) */}
                <g transform={`translate(${width - padding - 300}, ${padding - 65})`}>
                    <g transform="translate(12,16)">
                        <circle cx={8} cy={8} r={6} fill="#059669" />
                        <text x={26} y={13} fontSize="12" fill="#374151">Presentes (%)</text>
                        <circle cx={132} cy={8} r={6} fill="#dc2626" />
                        <text x={148} y={13} fontSize="12" fill="#374151">Ausentes (%)</text>
                        <circle cx={246} cy={8} r={6} fill="#f59e0b" />
                        <text x={262} y={13} fontSize="12" fill="#374151">Retardos (%)</text>
                    </g>
                </g>

                {/* lines */}
                <polyline fill="none" stroke="#059669" strokeWidth="2" points={presentPoints} />
                <polyline fill="none" stroke="#dc2626" strokeWidth="2" points={absentPoints} />
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={latePoints} />

                {presentPct.map((v, i) => {
                    const x = padding + i * xStep;
                    const y = height - padding - ((v / maxY) * (height - padding * 2));
                    return <circle key={`p-${i}`} cx={x} cy={y} r={3} fill="#059669" />;
                })}
                {absentPct.map((v, i) => {
                    const x = padding + i * xStep;
                    const y = height - padding - ((v / maxY) * (height - padding * 2));
                    return <circle key={`a-${i}`} cx={x} cy={y} r={3} fill="#dc2626" />;
                })}
                {latePct.map((v, i) => {
                    const x = padding + i * xStep;
                    const y = height - padding - ((v / maxY) * (height - padding * 2));
                    return <circle key={`l-${i}`} cx={x} cy={y} r={3} fill="#f59e0b" />;
                })}

                {/* x labels (month names) */}
                {months.map((d, i) => {
                    const x = padding + i * xStep;
                    const [y, m] = d.split('-');
                    const monthLabel = monthNames[parseInt(m, 10) - 1] + ' ' + y.slice(2);
                    return <text key={`x-${i}`} x={x} y={height - padding + 20} fontSize="12" textAnchor="middle" fill="#374151">{monthLabel}</text>;
                })}

                {/* legend removed (kept the wider legend earlier) */}
            </svg>
        </div>
    );
}
