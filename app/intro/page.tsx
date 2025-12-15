'use client';

import Link from 'next/link';
import { CurrencyDollarIcon, UserGroupIcon, CalculatorIcon, PercentBadgeIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
    {
        icon: UserGroupIcon,
        title: 'Equal Split',
        description: 'Split bills equally among friends with just a few taps.',
        color: 'from-blue-500 to-indigo-500',
    },
    {
        icon: PercentBadgeIcon,
        title: 'Percentage Split',
        description: 'Divide costs by percentage when fairness varies.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: CalculatorIcon,
        title: 'Custom Amounts',
        description: 'Set exact amounts for each person manually.',
        color: 'from-emerald-500 to-teal-500',
    },
    {
        icon: CurrencyDollarIcon,
        title: 'Tip Included',
        description: 'Add tips automatically before splitting.',
        color: 'from-orange-500 to-red-500',
    },
];

export default function IntroPage() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Hero Section */}
            <div className="relative z-10 px-6 pt-16 pb-24 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <CurrencyDollarIcon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Base Split
                        </h1>
                    </div>

                    <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto">
                        Split bills instantly on Base blockchain.
                    </p>
                    <p className="text-gray-500 mb-8">
                        No friction, just crypto. Share expenses with friends using shareable payment links.
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Get Started
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all group hover:scale-[1.02]"
                        >
                            <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="text-center mb-16">
                    <h2 className="text-2xl font-bold mb-8">How It Works</h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        <Step number={1} text="Enter total amount" />
                        <ArrowRightIcon className="w-5 h-5 text-gray-600 hidden md:block" />
                        <Step number={2} text="Choose split mode" />
                        <ArrowRightIcon className="w-5 h-5 text-gray-600 hidden md:block" />
                        <Step number={3} text="Share payment link" />
                        <ArrowRightIcon className="w-5 h-5 text-gray-600 hidden md:block" />
                        <Step number={4} text="Friends pay on-chain" />
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Built on Base • Powered by Coinbase</p>
                    <Link
                        href="/"
                        className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                    >
                        Start splitting now →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Step({ number, text }: { number: number; text: string }) {
    return (
        <div className="flex items-center gap-3 bg-gray-800/40 px-4 py-3 rounded-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                {number}
            </div>
            <span className="text-gray-300 text-sm">{text}</span>
        </div>
    );
}
