import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { ArrowRightIcon, BoltIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
    const { user } = useAuth();

    const features = [
        {
            name: 'Lightning Fast Generation',
            description: 'Generate highly custom cold emails in seconds using state-of-the-art AI.',
            icon: BoltIcon,
        },
        {
            name: 'Omnichannel Outreach',
            description: 'Get an email, a follow-up, and a LinkedIn DM perfectly synced for your prospect.',
            icon: DocumentTextIcon,
        },
        {
            name: ' Higher Conversion Rates',
            description: 'Personalized copy ensures higher open rates and better reply outcomes.',
            icon: ChartBarIcon,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-950">
            {/* Navigation */}
            <nav className="fixed z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <span className="text-xl font-bold tracking-tight text-slate-950">
                                MailGen AI
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="primary-glass inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="primary-glass inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-200 bg-white pb-20 pt-32 sm:pb-24 sm:pt-40">
                <div className="pointer-events-none absolute -right-32 -top-40 h-[32rem] w-[32rem] rounded-full bg-teal-100/70 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-slate-100 blur-3xl" aria-hidden="true" />
                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                    <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">AI-powered outreach workspace</p>
                    <h1 className="mb-8 text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                        Write Cold Emails That <br className="hidden md:block" />
                        <span className="text-teal-800">Actually Get Replies</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
                        Stop wasting hours drafting outreach. Enter your prospect's context, and let our AI generate the perfect structured sequence. Email, Follow-up, and LinkedIn DM all at once.
                    </p>
                    <div className="mt-10 flex justify-center gap-x-6">
                        <Link
                            to={user ? "/dashboard" : "/signup"}
                            className="primary-glass group inline-flex items-center justify-center rounded-lg px-7 py-3.5 text-sm font-semibold text-white"
                        >
                            Start Generating for Free
                            <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Everything you need to close more deals</h2>
                        <p className="mt-4 inline-block border-b-2 border-transparent pb-1 text-base text-slate-600">Built for sales teams who demand performance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature) => (
                            <div key={feature.name} className="interactive-card relative rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h3 className="mb-3 text-lg font-semibold text-slate-900">{feature.name}</h3>
                                <p className="leading-relaxed text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Look CTA */}
            <div className="relative isolate overflow-hidden bg-slate-950">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to scale your outreach?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                            Join hundreds of sales professionals using MailGen to accelerate their pipeline today.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/signup"
                                className="primary-glass rounded-lg px-6 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </div>
                <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
                    <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.7" />
                    <defs>
                        <radialGradient id="gradient">
                            <stop stopColor="#0f766e" />
                            <stop offset="1" stopColor="#334155" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <span className="mb-4 text-lg font-bold tracking-tight text-slate-900">
                        MailGen AI
                    </span>
                    <p className="text-sm text-slate-500">© {new Date().getFullYear()} MailGen AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;