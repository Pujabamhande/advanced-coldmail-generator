import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/useAuth';
import ThemeToggle from '../components/ThemeToggle';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    const userId = location.state?.userId;
    const email = location.state?.email;

    if (!userId) {
        navigate('/signup');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/verify-otp', { userId, otp });
            login(data);
            toast.success('Email verified successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
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
                <h2 className="mt-3 text-center text-3xl font-bold tracking-tight text-slate-950">Verify your email</h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    A verification code is being sent to <span className="font-medium text-slate-900">{email}</span>.
                    If it doesn't arrive, return to sign up and submit again to request a new code.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="interactive-card relative rounded-xl border border-slate-200 bg-white px-4 py-8 shadow-xl shadow-slate-900/5 sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="mb-2 block text-center text-sm font-semibold text-slate-800">Enter 6-digit OTP</label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="block w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-3 text-center font-mono text-2xl tracking-widest text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100"
                                placeholder="000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="primary-glass flex w-full justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-4 focus:ring-teal-100 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;