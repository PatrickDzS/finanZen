import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import * as Lucide from 'lucide-react';
import type { Expense } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { getExpenseAnalysis } from '../services/geminiService';
import LoadingPig from './ui/LoadingPig';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const sections = content.split('### ').filter(s => s.trim() !== '');

    const iconMap: { [key: string]: React.ReactNode } = {
        'Principais Áreas de Gasto': <Lucide.BarChart2 size={20} className="text-primary" />,
        'Dicas para Reduzir Despesas': <Lucide.Lightbulb size={20} className="text-primary" />,
        'Dica de Ouro': <Lucide.Sparkles size={20} className="text-primary" />,
    };

    return (
        <div>
            {sections.map((section, index) => {
                const [title, ...bodyParts] = section.split('\n');
                const body = bodyParts.join('\n').trim();
                const icon = iconMap[title.trim()] || <Lucide.Info size={20} className="text-primary" />;

                return (
                    <div className="mb-5" key={index}>
                        <div className="flex items-center mb-2">
                            <div className="p-1.5 bg-primary/10 rounded-full mr-3">{icon}</div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title.trim()}</h3>
                        </div>
                        <div className="pl-10 text-slate-500 dark:text-slate-400 space-y-2">
                             {body.split('\n').filter(line => line.trim() !== '').map((line, lineIndex) => {
                                if (line.startsWith('- ') || line.startsWith('* ')) {
                                     const boldRegex = /\*\*(.*?)\*\*/g;
                                     const parts = line.substring(2).split(boldRegex);

                                    return (
                                        <p key={lineIndex} className="flex">
                                            <span className="mr-2 text-primary">•</span>
                                            <span>
                                                {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-700 dark:text-slate-200">{part}</strong> : part)}
                                            </span>
                                        </p>
                                    );
                                }
                                return <p key={lineIndex}>{line}</p>
                             })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percentage = (Number(data.percent || 0) * 100).toFixed(0);
        return (
            <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-800 dark:text-slate-100">{`${data.name}: ${formatCurrency(data.value)}`}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{`Representa ${percentage}% do total`}</p>
            </div>
        );
    }
    return null;
};

interface ExpenseAnalysisProps {
    expenses: Expense[];
    income: number;
}

const ExpenseAnalysis: React.FC<ExpenseAnalysisProps> = ({ expenses, income }) => {
    const { theme } = useTheme();
    const [analysis, setAnalysis] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        const result = await getExpenseAnalysis(income, expenses);
        setAnalysis(result);
        setIsLoading(false);
    };
    
    const chartData = React.useMemo(() => {
        const dataMap = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
    }, [expenses]);
    
    const COLORS = React.useMemo(() => (
        theme === 'dark'
            ? ['#f87171', '#fbbF24', '#a78bfa', '#60a5fa', '#f472b6', '#9ca3af', '#818cf8', '#34d399']
            : ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#6b7280', '#4f46e5', '#10b981']
    ), [theme]);

    return (
        <Card>
            <div className="flex items-center mb-4">
                <Lucide.PieChart className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Análise de Despesas</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
                Veja um resumo dos seus gastos e receba dicas personalizadas da nossa IA para economizar.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-2" style={{ width: '100%', height: 250 }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={chartData} 
                                    cx="50%" 
                                    cy="50%" 
                                    labelLine={false} 
                                    outerRadius={90} 
                                    fill="#8884d8" 
                                    dataKey="value" 
                                    nameKey="name" 
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomPieTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Lucide.Inbox size={40} className="text-slate-300 dark:text-slate-600" />
                            <p className="mt-2 text-slate-500 dark:text-slate-400">Sem despesas para analisar.</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-3 text-center lg:text-left">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pronto para Otimizar?</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                        Clique abaixo para que nossa IA analise seus gastos e sugira formas inteligentes de economizar.
                    </p>
                    <Button onClick={handleAnalysis} disabled={isLoading || expenses.length === 0} leftIcon={<Lucide.Sparkles size={16}/>}>
                        {isLoading ? 'Analisando...' : 'Receber Dicas da IA'}
                    </Button>
                </div>
            </div>

            {isLoading && (
                 <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col items-center justify-center p-4">
                        <LoadingPig />
                         <p className="mt-4 text-slate-500 dark:text-slate-400 font-semibold loading-text-pulse">Buscando as melhores dicas para você...</p>
                    </div>
                </div>
            )}
            {analysis && !isLoading && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <MarkdownRenderer content={analysis} />
                </div>
            )}
        </Card>
    );
};

export default ExpenseAnalysis;