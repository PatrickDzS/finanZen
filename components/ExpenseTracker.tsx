import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { Expense } from '../types';
import { EXPENSE_CATEGORIES, iconMap } from '../constants';
import * as Lucide from 'lucide-react';
import AIAssistant from './AIAssistant';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { InfoTooltip } from './ui/Tooltip';

// NEW: Custom hook to get window width for responsive chart
const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

    React.useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowWidth;
};


// Helper functions
const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const getDueDateStatus = (dueDateString: string): { text: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(dueDateString);
    dueDate.setMinutes(dueDate.getMinutes() + dueDate.getTimezoneOffset());
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Vencido há ${Math.abs(diffDays)} dia(s)`, color: 'text-red-500 font-bold' };
    if (diffDays === 0) return { text: 'Vence hoje', color: 'text-amber-500 font-bold' };
    if (diffDays === 1) return { text: 'Vence amanhã', color: 'text-amber-500' };
    return { text: `Vence em ${diffDays} dias`, color: 'text-slate-500 dark:text-slate-400' };
};

// Sub-components
const ExpenseItem: React.FC<{ expense: Expense; onEdit: () => void; onDelete: () => void; }> = ({ expense, onEdit, onDelete }) => {
    const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.name === expense.category);
    // NEW: Prioritize the custom expense icon, fallback to category icon, then to a default.
    const IconComponent = iconMap[expense.icon || categoryInfo?.icon || 'Package'] || iconMap['Package'];
    const dueDateStatus = getDueDateStatus(expense.dueDate);

    return (
        <div className="group flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
            <div className="flex items-center min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 mr-4">
                    <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{expense.name}</p>
                    <p className={`text-sm ${dueDateStatus.color}`}>{expense.category} &bull; {dueDateStatus.text}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(expense.amount)}</span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary" title="Editar"><Lucide.Edit size={16} /></button>
                    <button onClick={onDelete} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-red-500" title="Excluir"><Lucide.Trash2 size={16} /></button>
                </div>
            </div>
        </div>
    );
};

interface ExpenseChartProps {
    expenses: Expense[];
    activeFilter: string;
    onCategorySelect: (category: string) => void;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, activeFilter, onCategorySelect }) => {
    const { theme } = useTheme();
    const windowWidth = useWindowWidth();
    const isMobile = windowWidth < 450; // Use a smaller breakpoint for narrow mobile screens

    const chartData = React.useMemo(() => {
        // FIX: The initial value for reduce was an empty object `{}`, which caused
        // TypeScript to not correctly infer the type of the accumulator `acc`.
        // By casting the initial value, we ensure `acc`
        // is correctly typed as Record<string, number>, resolving the error.
        const dataMap = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<string, number>);

        // FIX: Explicitly cast `value` to Number during sort to prevent type errors with string data.
        return Object.entries(dataMap).map(([name, value]) => ({ name, value })).sort((a, b) => Number(b.value) - Number(a.value));
    }, [expenses]);

    const COLORS = React.useMemo(() => (
        theme === 'dark'
            ? ['#818cf8', '#34d399', '#fbbF24', '#f87171', '#a78bfa', '#60a5fa', '#f472b6', '#9ca3af']
            : ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899', '#6b7280']
    ), [theme]);
    
    const handlePieClick = (data: any) => {
        const clickedCategory = data.name;
        // If clicking the already active category, reset to 'all'
        if (clickedCategory === activeFilter) {
            onCategorySelect('all');
        } else {
            onCategorySelect(clickedCategory);
        }
    };

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[350px] text-center p-6">
                <Lucide.PieChart size={48} className="text-slate-300 dark:text-slate-600" />
                <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">Sem dados para o gráfico</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Adicione ou ajuste os filtros.</p>
            </div>
        );
    }
    
    const CustomTooltip = ({ active, payload }: any) => {
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

    return (
        <div style={{ width: '100%', height: isMobile ? 400 : 350 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie 
                        data={chartData} 
                        cx="50%" 
                        cy={isMobile ? '45%' : '50%'} 
                        labelLine={false} 
                        outerRadius={isMobile ? 80 : 110} 
                        fill="#8884d8" 
                        dataKey="value" 
                        nameKey="name" 
                        stroke="none"
                        onClick={handlePieClick}
                        className="cursor-pointer"
                    >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            fillOpacity={activeFilter !== 'all' && entry.name !== activeFilter ? 0.4 : 1}
                            className="transition-opacity duration-300"
                          />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        iconSize={10} 
                        layout={isMobile ? 'horizontal' : 'vertical'} 
                        verticalAlign={isMobile ? 'bottom' : 'middle'} 
                        align={isMobile ? 'center' : 'right'} 
                        wrapperStyle={isMobile ? { fontSize: '12px' } : { right: -20, top: '50%', transform: 'translateY(-50%)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Main Component
interface ExpenseTrackerProps {
    expenses: Expense[];
    deleteExpense: (id: string) => void;
    openAddExpenseModal: () => void;
    onEditExpense: (expense: Expense) => void;
}

const dateFilterOptions = [
    { value: 'all', label: 'Sempre' },
    { value: 'this_month', label: 'Este Mês' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
    { value: 'this_quarter', label: 'Este Trimestre' },
    { value: 'this_year', label: 'Este Ano' },
    { value: 'custom', label: 'Intervalo Personalizado' },
];

const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({ expenses, deleteExpense, openAddExpenseModal, onEditExpense }) => {
    const [filter, setFilter] = React.useState('all');
    const [sort, setSort] = React.useState('dueDate_desc');
    const [isAIAssistantOpen, setIsAIAssistantOpen] = React.useState(false);
    const [dateFilter, setDateFilter] = React.useState('all');
    const [customStartDate, setCustomStartDate] = React.useState('');
    const [customEndDate, setCustomEndDate] = React.useState('');
    
    const [income] = useLocalStorage<number>('income', 0);

    const sortedAndFilteredExpenses = React.useMemo(() => {
        let startDate: Date | null = null;
        let endDate: Date | null = null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
            case 'this_month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last_30_days':
                startDate = new Date();
                startDate.setDate(today.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
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

        const filtered = expenses.filter(exp => {
            const categoryMatch = filter === 'all' || exp.category === filter;

            if (!categoryMatch) return false;

            if (dateFilter === 'all') return true;

            const expenseDate = new Date(exp.dueDate);
            expenseDate.setMinutes(expenseDate.getMinutes() + expenseDate.getTimezoneOffset());
            
            const isAfterStart = startDate ? expenseDate >= startDate : true;
            const isBeforeEnd = endDate ? expenseDate <= endDate : true;

            return isAfterStart && isBeforeEnd;
        });

        return [...filtered].sort((a, b) => {
            switch (sort) {
                case 'amount_asc': return a.amount - b.amount;
                case 'amount_desc': return b.amount - a.amount;
                case 'dueDate_asc': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                default: return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
            }
        });
    }, [expenses, filter, sort, dateFilter, customStartDate, customEndDate]);

    const totalFilteredExpenses = sortedAndFilteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const filterLabel = React.useMemo(() => {
        let label = filter === 'all' ? '' : filter;
        const dateLabel = dateFilterOptions.find(opt => opt.value === dateFilter)?.label || '';

        if (dateFilter !== 'all') {
            label += (label ? ` | ${dateLabel}` : dateLabel);
        }
        
        return label || 'Geral';
    }, [filter, dateFilter]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="flex items-center mb-4">
                           <Lucide.PieChart className="w-6 h-6 text-primary mr-3" />
                           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Despesas por Categoria</h2>
                        </div>
                        <ExpenseChart 
                            expenses={sortedAndFilteredExpenses} // Pass filtered expenses to chart
                            activeFilter={filter}
                            onCategorySelect={setFilter}
                        />
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <Lucide.ReceiptText className="w-8 h-8 text-primary mr-3" />
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Minhas Contas</h1>
                                    <p className="text-slate-500 dark:text-slate-400">Gerencie todos os seus gastos.</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button onClick={() => setIsAIAssistantOpen(true)} variant="ghost" size="sm" leftIcon={<Lucide.Sparkles size={16} />}>Conselho IA</Button>
                                <Button onClick={openAddExpenseModal} size="sm" leftIcon={<Lucide.PlusCircle size={16} />}>Nova Conta</Button>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                <div>
                                    <label htmlFor="date-filter" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Período
                                        <InfoTooltip content="Filtre suas despesas por um intervalo de tempo específico." />
                                    </label>
                                    <select id="date-filter" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"><option value="all">Sempre</option><option value="this_month">Este Mês</option><option value="last_30_days">Últimos 30 dias</option><option value="this_quarter">Este Trimestre</option><option value="this_year">Este Ano</option><option value="custom">Personalizado</option></select>
                                </div>
                                <div>
                                    <label htmlFor="filter-category" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Categoria
                                        <InfoTooltip content="Mostre apenas as despesas de uma categoria selecionada." />
                                    </label>
                                    <select id="filter-category" value={filter} onChange={(e) => setFilter(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"><option value="all">Todas</option>{EXPENSE_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}</select>
                                </div>
                                <div>
                                     <label htmlFor="sort-by" className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                                        Ordenar por
                                        <InfoTooltip content={<>Organize a lista por:<br />- Data (mais recentes/antigas)<br />- Valor (maior/menor)</>} />
                                    </label>
                                    <select id="sort-by" value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"><option value="dueDate_desc">Mais Recentes</option><option value="dueDate_asc">Mais Antigas</option><option value="amount_desc">Maior Valor</option><option value="amount_asc">Menor Valor</option></select>
                                </div>
                            </div>
                             {dateFilter === 'custom' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center space-x-2"><label htmlFor="start-date" className="text-sm font-medium shrink-0">De:</label><input type="date" id="start-date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" /></div>
                                    <div className="flex items-center space-x-2"><label htmlFor="end-date" className="text-sm font-medium shrink-0">Até:</label><input type="date" id="end-date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="text-sm w-full px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" /></div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800 -m-3 max-h-[400px] overflow-y-auto pr-2">
                            {sortedAndFilteredExpenses.length > 0 ? (
                                sortedAndFilteredExpenses.map((expense, index) => (
                                    <div key={expense.id} className="pt-2 expense-item-enter" style={{ animationDelay: `${index * 50}ms` }}><ExpenseItem expense={expense} onEdit={() => onEditExpense(expense)} onDelete={() => deleteExpense(expense.id)} /></div>
                                ))
                            ) : (
                                <div className="text-center py-10"><Lucide.FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600" /><p className="mt-2 text-slate-500 dark:text-slate-400">Nenhuma conta encontrada.</p><p className="text-sm text-gray-400 dark:text-gray-500">Tente ajustar os filtros ou adicione uma nova conta.</p></div>
                            )}
                        </div>

                        {sortedAndFilteredExpenses.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Total ({filterLabel})</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalFilteredExpenses)}</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <AIAssistant isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} income={income} expenses={expenses} balance={income - totalFilteredExpenses} goals={[]} investments={[]} context="general" />
        </>
    );
};

export default ExpenseTracker;