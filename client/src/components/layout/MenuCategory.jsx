import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MenuItem } from './MenuItem';

export const MenuCategory = ({ category, visibleChildren, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = category.icon;

    if (visibleChildren.length === 0) {
        return null;
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="font-medium">{category.label}</span>
                </div>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            
            {isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-2">
                    {visibleChildren.map((child) => (
                        <MenuItem key={child.path} item={child} onClose={onClose} />
                    ))}
                </div>
            )}
        </div>
    );
};
