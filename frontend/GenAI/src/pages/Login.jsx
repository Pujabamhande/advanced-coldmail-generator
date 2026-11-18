import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/useAuth';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data);
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-100 py-12 sm:px-6 lg:px-8">
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-slate-300/40 blur-3xl" />
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-teal-800">MailGen AI</p>
                <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-slate-950">Sign in to your account</h2>
                <p className="mt-2 text-center text-sm text-slate-600">Create thoughtful outreach with less effort.</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="interactive-card relative rounded-xl border border-slate-200 bg-white px-4 py-8 shadow-xl shadow-slate-900/5 sm:px-10">
                    <form className="relative space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-800">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100 sm:text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="primary-glass flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-teal-100 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-slate-600">Don't have an account? </span>
                        <Link to="/signup" className="font-semibold text-teal-800 hover:text-teal-950">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;