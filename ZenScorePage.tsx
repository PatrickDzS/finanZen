import * as React from 'react';
import Card from './ui/Card';
import * as Lucide from 'lucide-react';
import type { Investment } from '../types';
import { InfoTooltip } from './ui/Tooltip';

// Weights for Zen Score calculation (adjusted after removing goals)
const SAVINGS_WEIGHT = 0.50;
const EXPENSE_WEIGHT = 0.30;
const DIVERSIFICATION_WEIGHT = 0.20;

// Function to calculate the Zen Score and its components
const calculateZenScore = (income: number, totalExpenses: number, investments: Investment[]) => {
    // a. Savings Rate Score (target: save 20% or more of income)
    const balance = income - totalExpenses;
    const savingsRate = income > 0 ? balance / income : 0;
    const savingsScore = Math.max(0, Math.min(1, savingsRate / 0.20)) * SAVINGS_WEIGHT * 100;

    // b. Expense Ratio Score (lower is better, ideal <= 70%)
    const expenseRatio = income > 0 ? totalExpenses / income : 1;
    const expenseScore = Math.max(0, 1 - Math.max(0, (expenseRatio - 0.5)) / 0.5) * EXPENSE_WEIGHT * 100;

    // c. Investment Diversification Score
    const uniqueInvestmentTypes = new Set(investments.map(i => i.type)).size;
    const totalPossibleTypes = 4; // Based on types.ts
    const diversification = investments.length > 0 ? uniqueInvestmentTypes / totalPossibleTypes : 0;
    const diversificationScore = diversification * DIVERSIFICATION_WEIGHT * 100;

    const totalScore = Math.round(savingsScore + expenseScore + diversificationScore);
    
    return {
        totalScore,
        savingsScore: Math.round(savingsScore),
        expenseScore: Math.round(expenseScore),
        diversificationScore: Math.round(diversificationScore),
    };
};


interface ZenScorePageProps {
    income: number;
    totalExpenses: number;
    investments: Investment[];
}

const ZenScorePage: React.FC<ZenScorePageProps> = ({ income, totalExpenses, investments }) => {
    // Zen Score calculation
    const { totalScore, savingsScore, expenseScore, diversificationScore } = calculateZenScore(income, totalExpenses, investments);

    const getScoreColor = (score: number) => {
        if (score < 40) return { text: 'text-red-500', bg: 'bg-red-500', from: 'from-red-500' };
        if (score < 70) return { text: 'text-amber-500', bg: 'bg-amber-500', from: 'from-amber-500' };
        return { text: 'text-green-500', bg: 'bg-green-500', from: 'from-green-500' };
    };
    const scoreColor = getScoreColor(totalScore);

    const tooltipContent = (
        <div className="text-left p-2 space-y-2 max-w-sm">
            <h4 className="font-bold text-base text-slate-100 mb-2">Como seu Zen Score é calculado:</h4>
            <p className="text-xs text-slate-300">Sua pontuação de saúde financeira é uma média ponderada de três pilares:</p>
            <ul className="space-y-2 text-xs mt-2">
                <li className="flex items-start"><Lucide.TrendingUp size={14} className="text-green-400 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Taxa de Poupança ({SAVINGS_WEIGHT * 100}%):</strong> <span className="font-mono">{savingsScore.toFixed(0)}/{SAVINGS_WEIGHT * 100} pts</span><br/><span className="text-slate-400">Recompensa a porcentagem da sua renda que você economiza.</span></p></li>
                <li className="flex items-start"><Lucide.ShieldCheck size={14} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Controle de Despesas ({EXPENSE_WEIGHT * 100}%):</strong> <span className="font-mono">{expenseScore.toFixed(0)}/{EXPENSE_WEIGHT * 100} pts</span><br/><span className="text-slate-400">Pontua o quão bem suas despesas se encaixam na sua renda.</span></p></li>
                <li className="flex items-start"><Lucide.PieChart size={14} className="text-purple-400 mr-2 mt-0.5 flex-shrink-0" /><p><strong>Diversificação ({DIVERSIFICATION_WEIGHT * 100}%):</strong> <span className="font-mono">{diversificationScore.toFixed(0)}/{DIVERSIFICATION_WEIGHT * 100} pts</span><br/><span className="text-slate-400">Incentiva a distribuição dos seus investimentos para reduzir riscos.</span></p></li>
            </ul>
        </div>
    );

    return (
        <Card>
            <div className="flex items-center mb-6">
                <Lucide.Gauge className="w-8 h-8 text-primary mr-3" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Zen Score</h1>
                    <p className="text-slate-500 dark:text-slate-400">Um termômetro da sua saúde financeira.</p>
                </div>
            </div>
            <div className="flex items-center justify-center">
                 <Card className="w-full max-w-md transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <Lucide.HeartPulse className="w-6 h-6 text-primary mr-3" />
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sua Pontuação</h3>
                            <InfoTooltip content={tooltipContent} />
                        </div>
                    </div>
                    <div className="text-center my-4">
                        <span className={`text-6xl font-bold ${scoreColor.text}`}>{totalScore}</span>
                        <span className="text-2xl font-semibold text-slate-400 dark:text-slate-500">/ 100</span>
                    </div>
                     <div>
                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-2">Sua saúde financeira</p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className={`${scoreColor.bg} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${totalScore}%` }}></div>
                        </div>
                    </div>
                </Card>
            </div>
        </Card>
    );
};

export default ZenScorePage;