import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import {
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ArrowsPointingOutIcon,
    CheckIcon,
    ClipboardDocumentIcon,
    SparklesIcon,
    SpeakerWaveIcon,
    StopIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const getReview = (subject, body) => {
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    const wordCount = trimmedBody ? trimmedBody.split(/\s+/).length : 0;
    const sentences = trimmedBody.split(/[.!?]+/).filter(Boolean);
    const averageSentenceLength = sentences.length
        ? Math.round(wordCount / sentences.length)
        : wordCount;
    const informalPhrases = trimmedBody.match(/\b(gonna|wanna|gotta|ain't|lol|omg|thx|u|ur)\b/gi) || [];
    const hasExcessivePunctuation = /!!|[!?]{3,}/.test(`${trimmedSubject} ${trimmedBody}`);
    const hasGreeting = /^(hi|hello|dear|good morning|good afternoon|happy birthday)\b/i.test(trimmedBody);
    const hasClosing = /\b(best regards|kind regards|regards|sincerely|thank you|thanks|best|warmly|your friend)\b/i.test(trimmedBody);
    const checks = [
        {
            label: 'Clear, appropriate subject',
            passed: trimmedSubject.length >= 3 && trimmedSubject.length <= 80 && !/[A-Z]{5,}/.test(trimmedSubject) && !/[!?]{3,}/.test(trimmedSubject),
            points: 20,
            advice: 'Use a clear, relevant subject and avoid all-caps or excessive punctuation.',
            detail: `${trimmedSubject.length} characters`,
        },
        {
            label: 'Appropriate greeting and sign-off',
            passed: hasGreeting && hasClosing,
            points: 20,
            advice: 'Start with an appropriate greeting and finish with a suitable sign-off.',
            detail: 'Checks the email opening and closing',
        },
        {
            label: 'Respectful, polished language',
            passed: informalPhrases.length === 0 && !hasExcessivePunctuation,
            points: 25,
            advice: 'Replace slang or text-message abbreviations and avoid excessive punctuation.',
            detail: 'Checks for informal shorthand and excessive punctuation',
        },
        {
            label: 'Clear, complete sentences',
            passed: sentences.length > 0 && averageSentenceLength <= 30,
            points: 20,
            advice: 'Use complete, concise sentences that are easy to understand.',
            detail: `${sentences.length} sentences · about ${averageSentenceLength} words per sentence`,
        },
        {
            label: 'Suitable length',
            passed: wordCount >= 10 && wordCount <= 250,
            points: 15,
            advice: 'Keep the email focused and appropriate in length (10–250 words).',
            detail: `${wordCount} words · about ${averageSentenceLength} words per sentence`,
        },
    ];
    const score = checks.reduce((total, check) => total + (check.passed ? check.points : 0), 0);
    const improvements = checks.filter((check) => !check.passed).map((check) => check.advice);

    return {
        checks,
        score,
        wordCount,
        averageSentenceLength,
        readiness: score >= 80 ? 'Professional and polished' : score >= 60 ? 'Nearly ready—polish a few details' : 'Needs another edit',
        improvements: improvements.length ? improvements : ['No major professionalism issues found. Review the details before sending.'],
    };
};

const getResponsePrediction = (subject, body) => {
    const text = body.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const lowEffortCta = /\b(15|10|fifteen|ten)[ -]?(minute|min)\b|\b(brief chat|quick call|low[- ]pressure|no pressure|if useful|open to a chat)\b/i.test(text);
    const broadCta = /\b(let me know|connect|talk|chat|schedule|could we|would you)\b/i.test(text);
    const specificAudienceSignal = /\b(your|you|team|role|company|noticed|saw|congratulations)\b/i.test(text);
    const specificEvidence = /\b\d+(?:\.\d+)?%|\b\d+\s+(?:years|users|customers|teams|projects)\b|\b(measurable|specific result|case study)\b/i.test(text);
    const credibleOffer = /\b(help|improve|reduce|increase|save|built|designed|led|delivered|experience)\b/i.test(text);
    const subjectLength = subject.trim().length;
    const concise = words >= 45 && words <= 140;
    const noRiskyLanguage = !/\b(guaranteed|act now|click here|limited time|risk[- ]free|free!!!?)\b/i.test(`${subject} ${text}`);

    const factors = [
        {
            label: 'Recipient relevance',
            passed: specificAudienceSignal,
            weight: 25,
            explanation: specificAudienceSignal ? 'The copy refers directly to the recipient or their team.' : 'The draft has little recipient-specific language.',
        },
        {
            label: 'Credible value',
            passed: credibleOffer && specificEvidence,
            weight: 25,
            explanation: credibleOffer && specificEvidence ? 'A concrete benefit is supported by evidence.' : 'Add a specific outcome or proof point to support the offer.',
        },
        {
            label: 'Low-effort next step',
            passed: lowEffortCta,
            weight: 20,
            explanation: lowEffortCta ? 'The ask is framed as a small, easy next step.' : broadCta ? 'There is a CTA, but the effort or time commitment could be clearer.' : 'Add one clear, low-commitment question.',
        },
        {
            label: 'Easy to scan',
            passed: concise,
            weight: 15,
            explanation: concise ? `The ${words}-word email is within a concise outreach range.` : `The email is ${words} words; aim for 45–140 words.`,
        },
        {
            label: 'Subject and trust signals',
            passed: subjectLength >= 20 && subjectLength <= 65 && noRiskyLanguage,
            weight: 15,
            explanation: subjectLength >= 20 && subjectLength <= 65 && noRiskyLanguage ? 'The subject is a suitable length and the copy avoids common pressure phrases.' : 'Review subject length and remove pressure-heavy or overpromising wording.',
        },
    ];
    const score = factors.reduce((total, factor) => total + (factor.passed ? factor.weight : 0), 0);

    return {
        factors,
        score,
        outlook: score >= 75 ? 'Favorable signals' : score >= 50 ? 'Mixed signals' : 'Needs strengthening',
        summary: score >= 75
            ? 'The draft contains several qualities associated with stronger outreach: relevance, credible value, and an easy next step.'
            : score >= 50
                ? 'The draft has some promising elements. Address the weaker signals below to make the value and next step clearer.'
                : 'The current draft may be easy to overlook. Improve recipient relevance, proof, and the clarity of the ask.',
    };
};

const Dashboard = () => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [followUpLoading, setFollowUpLoading] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [predictionExpanded, setPredictionExpanded] = useState(false);
    const [result, setResult] = useState(null);
    const [subjectDraft, setSubjectDraft] = useState('');
    const [copied, setCopied] = useState('');
    const [speaking, setSpeaking] = useState(false);

    const subject = subjectDraft || result?.subject || '';
    const isOutreach = Boolean(result?.linkedInDM || result?.followUpEmail);
    const review = useMemo(() => getReview(subject, result?.emailBody || ''), [subject, result?.emailBody]);
    const responsePrediction = useMemo(
        () => getResponsePrediction(subject, result?.emailBody || ''),
        [subject, result?.emailBody],
    );
    const subjectSuggestions = useMemo(() => {
        if (!subject.trim()) return [];
        const cleaned = subject.trim().replace(/[.!?]+$/, '');
        const suggestions = [
            { label: 'Current', value: cleaned },
            { label: 'Value-led', value: 'A practical idea for your team' },
            { label: 'Conversation starter', value: 'Could we explore a potential fit?' },
        ];
        return suggestions.filter((suggestion, index) => (
            suggestions.findIndex((candidate) => candidate.value.toLowerCase() === suggestion.value.toLowerCase()) === index
        ));
    }, [subject]);

    useEffect(() => () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, []);

    useEffect(() => {
        if (!predictionExpanded) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setPredictionExpanded(false);
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [predictionExpanded]);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setResult(null);
        setSubjectDraft('');
        setPredictionExpanded(false);
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setSpeaking(false);
        try {
            const { data } = await api.post('/ai/generate-email', { prompt });
            setResult(data);
            toast.success('Email generated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied(''), 2000);
        } catch {
            toast.error('Clipboard access is unavailable in this browser.');
        }
    };

    const exportCampaign = () => {
        const sections = [`Subject: ${subject}`, `Email\n${result.emailBody}`];
        if (result.linkedInDM) sections.push(`LinkedIn message\n${result.linkedInDM}`);
        if (result.followUpEmail) sections.push(`Follow-up email\n${result.followUpEmail}`);
        const content = sections.join('\n\n');
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mailgen-campaign.txt';
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Campaign exported');
    };

    const toggleSpeech = () => {
        if (!('speechSynthesis' in window)) {
            toast.error('Text-to-speech is not supported in this browser.');
            return;
        }
        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(`${subject}. ${result.emailBody}`);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => {
            setSpeaking(false);
            toast.error('Could not play this email.');
        };
        window.speechSynthesis.speak(utterance);
        setSpeaking(true);
    };

    const generateFollowUp = async () => {
        setFollowUpLoading(true);
        try {
            const { data } = await api.post('/ai/generate-email', {
                prompt: `Write a fresh follow-up email for this cold outreach. Keep the same recipient and context, add a new angle, and do not repeat the original wording.\n\nOriginal context: ${prompt.slice(0, 800)}\n\nOriginal email: ${result.emailBody.slice(0, 800)}`,
                tone: 'professional',
            });
            setResult((current) => ({ ...current, followUpEmail: data.followUpEmail || data.emailBody }));
            toast.success('A new follow-up is ready');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not generate a follow-up.');
        } finally {
            setFollowUpLoading(false);
        }
    };

    const optimizeEmail = async () => {
        setOptimizing(true);
        const improvementNotes = review.improvements.slice(0, 3).join(' ');
        const optimizationPrompt = [
            'Rewrite the existing cold email to improve clarity, personalization, credible value, a low-pressure call to action, and readability.',
            'Preserve the original intent and all factual claims. Do not invent names, metrics, achievements, or company details.',
            'Use a professional tone appropriate to the recipient and context.',
            `Improvement guidance: ${improvementNotes}`,
            `Campaign context: ${prompt.slice(0, 350)}`,
            `Current subject: ${subject.slice(0, 120)}`,
            `Current email: ${(result?.emailBody || '').slice(0, 700)}`,
        ].join('\n\n');

        try {
            const { data } = await api.post('/ai/generate-email', {
                prompt: optimizationPrompt,
                tone: 'professional',
            });
            setResult((current) => ({ ...current, subject: data.subject, emailBody: data.emailBody }));
            setSubjectDraft('');
            toast.success('Optimized email applied to your campaign');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not optimize this email.');
        } finally {
            setOptimizing(false);
        }
    };

    const ResultCard = ({ title, content, type, children }) => (
        <section className="interactive-card mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <div className="flex items-center gap-2">
                    {children}
                    <button
                        type="button"
                        onClick={() => copyToClipboard(content, type)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-teal-800"
                        title={`Copy ${title}`}
                        aria-label={`Copy ${title}`}
                    >
                        {copied === type ? <CheckIcon className="h-5 w-5 text-emerald-600" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            {type === 'subject' ? (
                <input
                    value={subject}
                    onChange={(event) => setSubjectDraft(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-50"
                    aria-label="Edit email subject"
                />
            ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{content}</p>
            )}
        </section>
    );

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-7 border-b border-slate-200 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">Dashboard</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">Write the right email for any occasion.</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Describe who you are writing to and why. Emails are reviewed for polished, respectful writing that fits the recipient and occasion.</p>
            </div>

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.78fr)_minmax(0,1.55fr)]">
                <section className="interactive-card rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
                    <div className="mb-5 border-b border-slate-100 pb-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-slate-900">Email details</h2>
                            <span className="rounded-md bg-teal-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal-800">Step 1</span>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-slate-500">Describe the recipient, occasion or purpose, and details to include.</p>
                    </div>
                    <form onSubmit={handleGenerate}>
                        <label htmlFor="campaign-context" className="mb-2 block text-xs font-semibold text-slate-700">What email would you like to write?</label>
                        <textarea
                            id="campaign-context"
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            maxLength={2000}
                            className="h-52 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-50"
                            placeholder="Example: Write a warm, friendly birthday email to my friend. Or: I'm a backend engineer reaching out to a recruiter about a role..."
                        />
                        <div className="mt-1 text-right text-[11px] text-slate-400">{prompt.length} / 2000</div>
                        <p className="mt-3 text-xs leading-5 text-slate-500">Professional for work emails; naturally friendly for personal occasions.</p>
                        <button
                            type="submit"
                            disabled={loading || !prompt.trim()}
                            className="campaign-accent-surface campaign-generate-button mt-5 flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? 'Writing your email...' : 'Generate email'}
                        </button>
                    </form>
                </section>

                <div className="min-w-0">
                    {loading ? (
                        <div className="flex min-h-[480px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 text-center shadow-sm" role="status" aria-live="polite">
                            <SparklesIcon className="h-8 w-8 animate-pulse text-teal-700" />
                            <h2 className="mt-4 font-semibold text-slate-900">Creating your new email</h2>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Your previous result has been cleared. The new draft will appear here when it is ready.</p>
                        </div>
                    ) : result ? (
                        <>
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Your email</h2>
                                    <p className="mt-1 text-xs text-slate-500">Review and edit your generated content before sending.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={exportCampaign}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" /> Export .txt
                                </button>
                            </div>
                            <ResultCard title="Email subject" content={subject} type="subject" />
                            <ResultCard title="Email" content={result.emailBody} type="email">
                                <button
                                    type="button"
                                    onClick={toggleSpeech}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-teal-800"
                                    title={speaking ? 'Stop reading' : 'Read email aloud'}
                                    aria-label={speaking ? 'Stop reading email' : 'Read email aloud'}
                                >
                                    {speaking ? <StopIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
                                </button>
                            </ResultCard>
                            {result.linkedInDM && <ResultCard title="LinkedIn message" content={result.linkedInDM} type="linkedin" />}
                            {result.followUpEmail && <ResultCard title="Follow-up email" content={result.followUpEmail} type="followup">
                                <button
                                    type="button"
                                    onClick={generateFollowUp}
                                    disabled={followUpLoading}
                                    className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-teal-800 hover:bg-teal-50 disabled:opacity-50"
                                    title="Generate another follow-up"
                                >
                                    <ArrowPathIcon className={`h-4 w-4 ${followUpLoading ? 'animate-spin' : ''}`} />
                                    {followUpLoading ? 'Writing' : 'Regenerate'}
                                </button>
                            </ResultCard>}

                            {isOutreach && (
                            <>
                            <div className="animate-enter grid gap-4 xl:grid-cols-2">
                                <section className="interactive-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Email professionalism review</h3>
                                            <p className="mt-1 text-xs text-slate-500">Checklist-based review of the email's polish and appropriateness</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-slate-900">{review.score}</span>
                                            <span className="text-sm text-slate-500">/100</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${review.score}%` }} />
                                    </div>
                                    <ul className="mt-4 space-y-3">
                                        {review.checks.map((check) => (
                                            <li key={check.label} className="flex gap-2 text-sm">
                                                {check.passed ? <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-amber-400" />}
                                                <span className={check.passed ? 'text-slate-600' : 'text-slate-700'}>{check.passed ? check.label : check.advice}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="interactive-card rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Response Outlook Prediction</h3>
                                            <p className="mt-1 text-xs text-slate-500">Estimated response outlook</p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${responsePrediction.score >= 75 ? 'bg-emerald-50 text-emerald-700' : responsePrediction.score >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                            {responsePrediction.outlook}
                                        </span>
                                    </div>
                                    <div className="mt-5 flex items-end gap-2">
                                        <span className="text-4xl font-semibold tracking-tight text-slate-900">{responsePrediction.score}</span>
                                        <span className="pb-1 text-sm text-slate-500">/ 100 outlook index</span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${responsePrediction.score}%` }} />
                                    </div>
                                    <p className="mt-4 text-sm leading-5 text-slate-600">{responsePrediction.summary}</p>
                                    <button
                                        type="button"
                                        onClick={() => setPredictionExpanded(true)}
                                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-slate-50"
                                    >
                                        <ArrowsPointingOutIcon className="h-4 w-4" />
                                        Open full prediction &amp; optimization
                                    </button>
                                    <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                                        Content-based estimate only—not a measured or guaranteed reply probability.
                                    </p>
                                </section>
                            </div>
                            {predictionExpanded && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-3 sm:p-6"
                                    onMouseDown={(event) => {
                                        if (event.target === event.currentTarget) setPredictionExpanded(false);
                                    }}
                                >
                                    <section
                                        role="dialog"
                                        aria-modal="true"
                                        aria-labelledby="reply-prediction-title"
                                        className="prediction-modal animate-enter flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-300/20 shadow-2xl"
                                    >
                                        <header className="flex items-start justify-between gap-4 border-b border-slate-200/20 px-5 py-4 sm:px-7">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">Campaign intelligence</p>
                                                <h2 id="reply-prediction-title" className="mt-1 text-xl font-semibold text-slate-100">Response Outlook Prediction</h2>
                                                <p className="mt-1 text-sm text-slate-300">Focused view of draft readiness, improvement opportunities, and subject options.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPredictionExpanded(false)}
                                                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                                                aria-label="Close reply prediction"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </header>
                                        <div className="overflow-y-auto px-5 py-5 sm:px-7">
                                            <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
                                                <div className="space-y-5">
                                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-300">Estimated response outlook</p>
                                                                <p className="mt-2 text-5xl font-semibold tracking-tight text-white">{responsePrediction.score}<span className="ml-1 text-base font-normal text-slate-400">/100</span></p>
                                                            </div>
                                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${responsePrediction.score >= 75 ? 'bg-emerald-500/15 text-emerald-300' : responsePrediction.score >= 50 ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>
                                                                {responsePrediction.outlook}
                                                            </span>
                                                        </div>
                                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                                                            <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${responsePrediction.score}%` }} />
                                                        </div>
                                                        <p className="mt-3 text-xs leading-5 text-slate-400">
                                                            {responsePrediction.summary} This content-only heuristic is not trained on recipient behavior or historical reply data.
                                                        </p>
                                                    </div>
                                                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                                                        <h3 className="text-sm font-semibold text-white">Optimization opportunities</h3>
                                                        <ul className="mt-3 space-y-3">
                                                            {review.improvements.map((improvement) => (
                                                                <li key={improvement} className="flex gap-2 text-sm leading-5 text-slate-300">
                                                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                                                                    {improvement}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={optimizeEmail}
                                                        disabled={optimizing}
                                                        className="campaign-accent-surface flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        <SparklesIcon className={`h-5 w-5 ${optimizing ? 'animate-pulse' : ''}`} />
                                                        {optimizing ? 'Optimizing email...' : 'Optimize email with AI'}
                                                    </button>
                                                    <p className="text-xs leading-5 text-slate-400">
                                                        The optimized draft replaces the current subject and email. Review factual details before sending.
                                                    </p>
                                                </div>

                                                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
                                                    <h3 className="text-sm font-semibold text-white">Response outlook factors</h3>
                                                    <div className="mt-4 space-y-4">
                                                        {responsePrediction.factors.map((factor) => (
                                                            <div key={factor.label}>
                                                                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                                                                    <span className="font-medium text-slate-200">{factor.label}</span>
                                                                    <span className={factor.passed ? 'text-emerald-300' : 'text-amber-300'}>{factor.passed ? 'Positive signal' : 'Opportunity'}</span>
                                                                </div>
                                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                                                                    <div className={`h-full rounded-full transition-all ${factor.passed ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${factor.passed ? 100 : 8}%` }} />
                                                                </div>
                                                                <p className="mt-1.5 text-xs leading-5 text-slate-400">{factor.explanation}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-6 border-t border-white/10 pt-5">
                                                        <div className="mb-3 flex items-center justify-between gap-2">
                                                            <h3 className="text-sm font-semibold text-white">Subject line alternatives</h3>
                                                            <span className="text-xs text-slate-400">Select to apply</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {subjectSuggestions.map((suggestion) => (
                                                                <button
                                                                    type="button"
                                                                    key={suggestion.label}
                                                                    onClick={() => setSubjectDraft(suggestion.value)}
                                                                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${subject === suggestion.value ? 'border-blue-300/50 bg-blue-400/10' : 'border-white/10 hover:border-blue-300/30 hover:bg-white/[0.04]'}`}
                                                                >
                                                                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-blue-300">{suggestion.label}</span>
                                                                    <span className="mt-1 block text-sm text-slate-200">{suggestion.value}</span>
                                                                    <span className="mt-1 block text-xs text-slate-400">{suggestion.value.length} characters</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}
                            </>
                            )}
                        </>
                    ) : (
                        <div className="empty-state-glass flex min-h-[480px] flex-col items-center justify-center rounded-2xl px-8 text-center">
                            <div className="empty-state-icon mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-white">
                                <ClipboardDocumentIcon className="h-7 w-7" />
                            </div>
                            <h2 className="font-semibold text-slate-800">Your next great email starts here</h2>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Write for any occasion and audience. Your email will fit the relationship and purpose, and the review checks its professionalism.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
