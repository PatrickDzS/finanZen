import * as React from 'react';
import { ResponsiveContainer, Sankey, Tooltip, TooltipProps } from 'recharts';
import Card from './ui/Card';
import * as Lucide from 'lucide-react';
import type { Expense } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface FinancialFlowProps {
    income: number;
    expenses: Expense[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Sub-componente para renderizar um nó personalizado no gráfico
// Usar React.memo previne re-renderizações desnecessárias se as props não mudarem.
const SankeyNode = React.memo(({ x, y, width, height, index, payload, colors, theme }: any) => {
    // A lógica de posicionamento do texto checa se o nó está na primeira metade do gráfico (x < 100)
    // para alinhar o texto à direita (start) ou à esquerda (end), evitando que o texto saia da área visível.
    const isStartNode = x < 100;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={colors[index % colors.length]} rx="2" ry="2"/>
            <text
                x={isStartNode ? x + width + 6 : x - 6}
                y={y + height / 2 + 5}
                textAnchor={isStartNode ? "start" : "end"}
                fill={theme === 'dark' ? "#e2e8f0" : "#334155"}
                className="font-semibold text-sm"
            >
                {payload.name}
            </text>
        </g>
    );
});

// Sub-componente para o tooltip personalizado
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        // O payload do Sankey é um pouco diferente, as informações estão aninhadas
        const linkPayload = payload[0].payload;
        if (linkPayload && linkPayload.source && linkPayload.target) {
             return (
                <div className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {linkPayload.source.name} &rarr; {linkPayload.target.name}
                    </p>
                    <p className="text-primary font-bold">{formatCurrency(linkPayload.value as number)}</p>
                </div>
            );
        }
    }
    return null;
};


const FinancialFlow: React.FC<FinancialFlowProps> = ({ income, expenses }) => {
    const { theme } = useTheme();

    const sankeyData = React.useMemo(() => {
        if (income <= 0) {
            return { nodes: [], links: [] };
        }

        const totalExpenses = expenses.reduce((sum: number, exp) => sum + exp.amount, 0);
        const balance: number = income - totalExpenses;

        const nodes: { name: string }[] = [{ name: 'Renda' }];
        const links: { source: number; target: number; value: number }[] = [];

        if (totalExpenses > 0) {
            const despesasNodeIndex = nodes.length;
            nodes.push({ name: 'Despesas' });
            links.push({ source: 0, target: despesasNodeIndex, value: totalExpenses });

            const expensesByCategory = expenses.reduce((acc, exp) => {
                acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                return acc;
            }, {} as Record<string, number>);

            Object.entries(expensesByCategory).forEach(([category, amount]) => {
                if (amount > 0) {
                    const categoryNodeIndex = nodes.length;
                    nodes.push({ name: category });
                    links.push({ source: despesasNodeIndex, target: categoryNodeIndex, value: amount });
                }
            });
        }

        if (balance > 0) {
            const saldoNodeIndex = nodes.length;
            nodes.push({ name: 'Saldo' });
            links.push({ source: 0, target: saldoNodeIndex, value: balance });
        }
        
        return { nodes, links };
    }, [income, expenses]);

    const nodeColors = React.useMemo(() => (
        theme === 'dark'
            ? ['#818cf8', '#f87171', '#34d399', '#fbbF24', '#a78bfa', '#60a5fa', '#f472b6', '#9ca3af']
            : ['#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#6b7280']
    ), [theme]);

    const linkColor = theme === 'dark' ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.6)';

    if (income <= 0) {
        return null;
    }

    return (
        <Card>
            <div className="flex items-center mb-4">
                <Lucide.GitBranch className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">O Caminho do Seu Dinheiro</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
                Visualize para onde sua renda está sendo direcionada este mês.
            </p>
            <div style={{ width: '100%', height: 300 }}>
                {sankeyData.links.length > 0 ? (
                    <ResponsiveContainer>
                        <Sankey
                            data={sankeyData}
                            nodePadding={50}
                            link={{ stroke: linkColor, strokeOpacity: 0.6 }}
                            iterations={32}
                            margin={{ top: 5, right: 120, bottom: 5, left: 120 }}
                            node={<SankeyNode colors={nodeColors} theme={theme} />}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Sankey>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <Lucide.GitBranch size={48} className="text-slate-300 dark:text-slate-600" />
                        <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">Aguardando suas despesas...</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500">Assim que você registrar um gasto, o caminho do seu dinheiro aparecerá aqui!</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default FinancialFlow;