import React from 'react';

export const SidebarOverlay = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            onClick={onClose}
            className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden"
        />
    );
};
