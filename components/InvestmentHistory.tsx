import * as React from 'react';
import Card from './ui/Card';
import type { Investment } from '../types';
import * as Lucide from 'lucide-react';

interface InvestmentHistoryProps {
    investments: Investment[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adjust for timezone offset to show correct day
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
}

const InvestmentHistory: React.FC<InvestmentHistoryProps> = ({ investments }) => {
    // State for filters
    const [typeFilter, setTypeFilter] = React.useState<string>('all');
    const [dateFilter, setDateFilter] = React.useState('all');
    const [customStartDate, setCustomStartDate] = React.useState('');
    const [customEndDate, setCustomEndDate] = React.useState('');

    const investmentIcons: Record<Investment['type'], React.ReactNode> = {
        'Renda Fixa': <Lucide.Shield size={20} className="text-blue-500" />,
        'Renda Variável': <Lucide.TrendingUp size={20} className="text-green-500" />,
        'Criptomoedas': <Lucide.Bitcoin size={20} className="text-amber-500" />,
        'Fundo de Renda Fixa': <Lucide.Landmark size={20} className="text-purple-500" />,
    };

    // Memoize filtered investments based on state
    const filteredInvestments = React.useMemo(() => {
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Date filter logic
        switch (dateFilter) {
            case 'this_month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'this_quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
                break;
            case 'this_year':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date(today.getFullYear(), 11, 31);
                break;
            case 'custom':
                if (customStartDate) {
                    startDate = new Date(customStartDate);
                    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
                }
                if (customEndDate) {
                    endDate = new Date(customEndDate);
                    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
                }
                break;
        }

        if (endDate) endDate.setHours(23, 59, 59, 999);

        // Apply filters
        return investments.filter(inv => {
            // Type filter
            const typeMatch = typeFilter === 'all' || inv.type === typeFilter;
            if (!typeMatch) return false;

            // Date filter
            if (dateFilter === 'all') return true;
            const investmentDate = new Date(inv.date);
            investmentDate.setMinutes(investmentDate.getMinutes() + investmentDate.getTimezoneOffset());
            
            const isAfterStart = startDate ? investmentDate >= startDate : true;
            const isBeforeEnd = endDate ? investmentDate <= endDate : true;

            return isAfterStart && isBeforeEnd;
        });

    }, [investments, typeFilter, dateFilter, customStartDate, customEndDate]);
    
    // Recalculate totals based on filtered data
    const totalsByType = React.useMemo(() => {
        const totals: { [key in Investment['type']]: number } = {
            'Renda Fixa': 0,
            'Renda Variável': 0,
            'Criptomoedas': 0,
            'Fundo de Renda Fixa': 0,
        };
        filteredInvestments.forEach(inv => {
            if (totals[inv.type] !== undefined) {
                totals[inv.type] += inv.amount;
            }
        });
        return totals;
    }, [filteredInvestments]);

    // Regroup investments based on filtered data
    const groupedInvestments = React.useMemo(() => {
        const groups: { [key: string]: { investments: Investment[], total: number } } = {};
        
        const sorted = [...filteredInvestments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        sorted.forEach(inv => {
            const date = new Date(inv.date);
            const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
            const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

            if (!groups[capitalizedMonth]) {
                groups[capitalizedMonth] = { investments: [], total: 0 };
            }
            groups[capitalizedMonth].investments.push(inv);
            groups[capitalizedMonth].total += inv.amount;
        });
        return groups;
    }, [filteredInvestments]);

    return (
        <Card>
            <div className="flex items-center mb-4">
                 <Lucide.History className="w-6 h-6 text-primary mr-3" />
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Histórico de Investimentos</h2>
            </div>
            
            <div className="flex flex-col space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type-filter" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Filtrar por tipo</label>
                        <select id="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="all">Todos os Tipos</option>
                            {(Object.keys(investmentIcons) as Array<keyof typeof investmentIcons>).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-filter-inv" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Filtrar por período</label>
                        <select id="date-filter-inv" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="all">Sempre</option>
                            <option value="this_month">Este Mês</option>
                            <option value="this_quarter">Este Trimestre</option>
                            <option value="this_year">Este Ano</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                </div>
                {dateFilter === 'custom' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div>
                           <label htmlFor="start-date-inv" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">De:</label>
                           <input type="date" id="start-date-inv" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                           <label htmlFor="end-date-inv" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Até:</label>
                           <input type="date" id="end-date-inv" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                )}
            </div>

            {filteredInvestments.length > 0 && (
                 <div className="mb-6">
                    <h3 className="text-base font-semibold text-slate-600 dark:text-slate-300 mb-2">Total Aportado (Filtro)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* FIX: Cast `type` to Investment['type'] to satisfy the index signature of `totalsByType` and `investmentIcons`. */}
                        {(Object.keys(totalsByType) as Array<Investment['type']>).map((type) => {
                             if (totalsByType[type] > 0) {
                                 return (
                                    <div key={type} className="flex items-center p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg">
                                        <div className="p-2 bg-primary/10 rounded-full mr-3">
                                            {investmentIcons[type]}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{type}</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalsByType[type])}</p>
                                        </div>
                                    </div>
                                )
                             }
                             return null;
                        })}
                    </div>
                </div>
            )}

            <div className="space-y-4 pr-2 max-h-[400px] overflow-y-auto">
                {filteredInvestments.length > 0 ? (
                    Object.entries(groupedInvestments).map(([monthYear, data]) => {
                        const groupData = data as { investments: Investment[], total: number };
                        return (
                            <div key={monthYear}>
                                <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200 dark:border-slate-700">
                                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200">{monthYear}</h3>
                                    <span className="font-semibold text-sm text-green-600 dark:text-green-400">{formatCurrency(groupData.total)}</span>
                                </div>
                                <div className="space-y-2">
                                    {groupData.investments.map(investment => (
                                        <div key={investment.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-primary/10 rounded-full mr-3">
                                                    {investmentIcons[investment.type]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(investment.amount)}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">em {investment.type}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-slate-400 dark:text-slate-500">{formatDate(investment.date)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <Lucide.SearchX size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Nenhum investimento encontrado.</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Tente ajustar os filtros ou adicione um novo investimento.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default InvestmentHistory;