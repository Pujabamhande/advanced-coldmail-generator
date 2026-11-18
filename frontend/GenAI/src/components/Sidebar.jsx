import React from 'react';
import { NavLink } from 'react-router-dom';
import { EnvelopeIcon, HomeIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
    return (
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white text-slate-900 md:flex">
            <div className="flex h-[72px] items-center gap-3 border-b border-slate-100 px-6">
                <div className="workspace-glass-surface flex h-9 w-9 items-center justify-center rounded-lg">
                    <EnvelopeIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-sm font-semibold tracking-tight text-slate-950">MailGen AI</h1>
                    <p className="text-[11px] text-slate-400">Outreach workspace</p>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6">
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'workspace-glass-surface' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`
                    }
                >
                    <HomeIcon className="h-[18px] w-[18px]" />
                    Dashboard
                </NavLink>
            </nav>

            <div className="m-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-teal-700" />
                    <span className="text-xs font-semibold text-slate-800">AI writing workspace</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-4 text-slate-500">Create thoughtful outreach with a clearer, more personal approach.</p>
            </div>
        </aside>
    );
};

export default Sidebar;