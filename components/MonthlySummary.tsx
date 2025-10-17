import * as React from 'react';
import Card from './ui/Card';
import * as Lucide from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface MonthlySummaryProps {
    income: number;
    totalExpenses: number;
    balance: number;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


const MonthlySummary: React.FC<MonthlySummaryProps> = ({ income, totalExpenses, balance }) => {
    const isPositive = balance >= 0;
    const { theme } = useTheme();

    const chartData = [
        {
            name: 'Mês Atual',
            Renda: income,
            Despesas: totalExpenses,
        },
    ];
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{`Renda: ${formatCurrency(payload[0].value)}`}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{`Despesas: ${formatCurrency(payload[1].value)}`}</p>
                </div>
            );
        }
        return null;
    };

    const incomeColor = theme === 'dark' ? '#34d399' : '#10b981';
    const expenseColor = theme === 'dark' ? '#f87171' : '#ef4444';

    return (
        <Card>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Resumo do Mês</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${isPositive ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                    {isPositive ? (
                        <Lucide.TrendingUp size={40} className="text-green-500 mb-3" />
                    ) : (
                        <Lucide.TrendingDown size={40} className="text-red-500 mb-3" />
                    )}
                    <p className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isPositive ? 'Mês no Verde' : 'Mês no Vermelho'}
                    </p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-50 mt-1">{formatCurrency(balance)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Saldo Final</p>
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center mb-4">Comparativo Renda vs. Despesas</h3>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <YAxis 
                                    stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                                    tickFormatter={(tick) => `R$${tick/1000}k`}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
                                <Legend wrapperStyle={{fontSize: "12px"}}/>
                                <Bar dataKey="Renda" fill={incomeColor} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Despesas" fill={expenseColor} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MonthlySummary;
