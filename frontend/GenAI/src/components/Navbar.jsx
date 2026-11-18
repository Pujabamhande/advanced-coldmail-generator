import React from 'react';
import { useAuth } from '../context/useAuth';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';

    return (
        <header className="z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
            <div className="hidden md:block">
                <p className="text-xs font-medium text-slate-500">Welcome back</p>
                <p className="text-sm font-semibold text-slate-900">{firstName}</p>
            </div>
            <div className="text-sm font-bold text-slate-900 md:hidden">
                MailGen AI
            </div>

            <div className="flex items-center gap-3">
                <ThemeToggle />
                <span className="workspace-glass-surface hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex">
                    Workspace ready
                </span>
                <span className="hidden h-8 w-px bg-slate-200 sm:block" />
                <button
                    onClick={logout}
                    className="logout-button flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="h-[18px] w-[18px]" />
                    <span>Sign out</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;