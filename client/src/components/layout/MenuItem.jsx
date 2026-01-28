import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const MenuItem = ({ item, onClose }) => {
    const location = useLocation();
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
        <Link
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
        >
            <Icon size={20} />
            <span className="font-medium">{item.label}</span>
        </Link>
    );
};
