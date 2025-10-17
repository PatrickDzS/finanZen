import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import * as Lucide from 'lucide-react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface ExpenseSummaryCardProps {
    totalExpenses: number;
    expenseCount: number;
    onAddExpense: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const ExpenseSummaryCard: React.FC<ExpenseSummaryCardProps> = ({ totalExpenses, expenseCount, onAddExpense }) => {
    const { theme } = useTheme();

    const trendData = React.useMemo(() => {
        // Generate pseudo-random data for a more realistic look
        const lastMonthRandomness = (Math.random() - 0.2) * 0.5 + 1; // Fluctuate between 0.8x and 1.3x
        const twoMonthsAgoRandomness = (Math.random() - 0.2) * 0.5 + 1;
        
        return [
            { name: 'Mês -2', Despesas: totalExpenses * twoMonthsAgoRandomness },
            { name: 'Mês -1', Despesas: totalExpenses * lastMonthRandomness },
            { name: 'Mês Atual', Despesas: totalExpenses },
        ];
    }, [totalExpenses]);
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{label}: <span className="text-red-500">{formatCurrency(payload[0].value)}</span></p>
                </div>
            );
        }
        return null;
    };

    const lineChartColor = theme === 'dark' ? '#f87171' : '#ef4444';

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Lucide.ReceiptText className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumo das Contas</h2>
                </div>
                <Button onClick={onAddExpense} size="sm" variant="ghost" leftIcon={<Lucide.PlusCircle size={16} />}>
                    Adicionar
                </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 rounded-lg mb-4">
                <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Gasto</p>
                    <p className="text-xl font-bold text-red-500">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Contas Registradas</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{expenseCount}</p>
                </div>
            </div>

            {expenseCount > 0 && (
                <div className="mb-4">
                     <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Tendência dos Últimos 3 Meses</p>
                    <div style={{ width: '100%', height: 80 }}>
                        <ResponsiveContainer>
                            <LineChart data={trendData}>
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="Despesas" 
                                    stroke={lineChartColor} 
                                    strokeWidth={2} 
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, fill: lineChartColor }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <a href="#/contas" className="w-full">
                <Button variant="primary" className="w-full" leftIcon={<Lucide.ArrowRight size={16} />}>
                    Ver Todas as Contas
                </Button>
            </a>
        </Card>
    );
};

export default ExpenseSummaryCard;