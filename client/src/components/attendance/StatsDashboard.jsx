import React from 'react';

export const StatsDashboard = ({ stats }) => {
    const calculatePercentage = (value, total) => {
        return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard
                title="Total de Registros"
                value={stats.total}
                color="blue"
            />
            <StatCard
                title="Presentes"
                value={stats.present}
                percentage={calculatePercentage(stats.present, stats.total)}
                color="green"
            />
            <StatCard
                title="Ausentes"
                value={stats.absent}
                percentage={calculatePercentage(stats.absent, stats.total)}
                color="red"
            />
            <StatCard
                title="Retardos"
                value={stats.late}
                percentage={calculatePercentage(stats.late, stats.total)}
                color="yellow"
            />
        </div>
    );
};

const StatCard = ({ title, value, percentage, color }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-500 text-blue-600',
        green: 'bg-green-50 border-green-500 text-green-600',
        red: 'bg-red-50 border-red-500 text-red-600',
        yellow: 'bg-yellow-50 border-yellow-500 text-yellow-600'
    };

    return (
        <div className={`${colorClasses[color]} border-l-4 rounded-lg p-4`}>
            <p className="text-gray-600 text-sm font-semibold">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            {percentage !== undefined && (
                <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
            )}
        </div>
    );
};
