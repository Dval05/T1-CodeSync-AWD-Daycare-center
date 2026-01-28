import React from 'react';

export const SidebarHeader = ({ onClose }) => (
    <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">NiceKids</h1>
        <button 
            onClick={onClose}
            className="text-slate-400 lg:hidden hover:text-white"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);
