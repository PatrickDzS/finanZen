import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import * as Lucide from 'lucide-react';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MetricCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; description?: string }> = ({ title, value, icon, color, description }) => {
    return (
        <Card className="flex-1 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col justify-between">
            <div>
                <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${color.replace('text-', 'bg-')}/10`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                    </div>
                </div>
            </div>
            {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{description}</p>}
        </Card>
    );
};


interface DashboardSummaryMetricsProps {
    income: number;
    setIncome: React.Dispatch<React.SetStateAction<number>>;
    totalExpenses: number;
    balance: number;
}

const DashboardSummaryMetrics: React.FC<DashboardSummaryMetricsProps> = ({ income, setIncome, totalExpenses, balance }) => {
    const [isEditingIncome, setIsEditingIncome] = React.useState(false);
    const [incomeValue, setIncomeValue] = React.useState(formatCurrency(income));

    React.useEffect(() => {
        if (!isEditingIncome) {
            setIncomeValue(formatCurrency(income));
        }
    }, [income, isEditingIncome]);

    const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        setIncomeValue(value === '' ? '' : formatCurrency(Number(value) / 100));
    };

    const handleSaveIncome = () => {
        const rawValue = incomeValue.replace(/[R$\.\s]/g, '').replace(',', '.');
        const numericAmount = parseFloat(rawValue);
        if (!isNaN(numericAmount)) {
            setIncome(numericAmount);
        }
        setIsEditingIncome(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                         <div className="p-3 rounded-full mr-4 bg-green-500/10"><Lucide.DollarSign className="w-6 h-6 text-green-500" /></div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Renda Mensal</p>
                            {isEditingIncome ? (
                                <input type="text" value={incomeValue} onChange={handleIncomeChange} onBlur={handleSaveIncome} onKeyPress={(e) => e.key === 'Enter' && handleSaveIncome()} className="mt-1 block w-full px-2 py-1 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-xl font-bold" autoFocus />
                            ) : (
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(income)}</p>
                            )}
                        </div>
                    </div>
                     <Button variant="ghost" size="sm" onClick={() => setIsEditingIncome(!isEditingIncome)} className="p-2 h-8 w-8">{isEditingIncome ? <Lucide.Check size={16} /> : <Lucide.Edit2 size={16} />}</Button>
                </div>
                 <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Este é o valor base para seus cálculos.</p>
            </Card>
            <MetricCard title="Total de Despesas" value={formatCurrency(totalExpenses)} icon={<Lucide.ArrowDownCircle className="w-6 h-6 text-red-500" />} color="text-red-500" />
            <MetricCard title="Saldo Disponível" value={formatCurrency(balance)} icon={balance >= 0 ? <Lucide.TrendingUp className="w-6 h-6 text-blue-500" /> : <Lucide.TrendingDown className="w-6 h-6 text-amber-500" />} color={balance >= 0 ? "text-blue-500" : "text-amber-500"} />
        </div>
    );
};

export default DashboardSummaryMetrics;
