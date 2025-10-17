import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import * as Lucide from 'lucide-react';
import type { Investment } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';


interface InvestmentPlannerProps {
    balance: number;
    onInvest: (amount: number, type: Investment['type'], date: string) => void;
    onAddInvestmentReminder: (amount: number, type: Investment['type'], date: string) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const parseCurrency = (value: string) => parseFloat(value.replace(/[R$\.\s]/g, '').replace(',', '.')) || 0;

const InvestmentRow: React.FC<{
    type: Investment['type'];
    label: string;
    balance: number;
    suggestedPercentage: number;
    description: string;
    icon: React.ReactNode;
    color: string;
    onInvest: (amount: number, type: Investment['type'], date: string) => void;
    onAddReminder: (amount: number, type: Investment['type'], date: string) => void;
}> = ({ type, label, balance, suggestedPercentage, description, icon, color, onInvest, onAddReminder }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [amount, setAmount] = React.useState(formatCurrency(balance * (suggestedPercentage / 100)));
    const [percentage, setPercentage] = React.useState(suggestedPercentage.toString());
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

    React.useEffect(() => {
        if (!isEditing) {
            const suggestedAmount = balance * (suggestedPercentage / 100);
            setAmount(formatCurrency(suggestedAmount));
            setPercentage(suggestedPercentage.toString());
        }
    }, [balance, suggestedPercentage, isEditing]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        const numericValue = Number(value) / 100;
        setAmount(formatCurrency(numericValue));
        
        if (balance > 0) {
            const newPercentage = (numericValue / balance) * 100;
            setPercentage(isNaN(newPercentage) || newPercentage === 0 ? '' : newPercentage.toFixed(2));
        } else {
            setPercentage('');
        }
    };
    
    const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '').slice(0, 6); // Allow only numbers/dot, limit length
        setPercentage(value);

        const numericPercentage = parseFloat(value);
        if (!isNaN(numericPercentage) && balance > 0) {
            const newAmount = balance * (numericPercentage / 100);
            setAmount(formatCurrency(newAmount));
        } else if (value === '' || value === '0') {
            setAmount(formatCurrency(0));
        }
    };

    const handleInvest = () => {
        const numericAmount = parseCurrency(amount);
        if (numericAmount > 0) {
            onInvest(numericAmount, type, date);
            setIsEditing(false);
        }
    };
    
    const handleAddReminder = () => {
        const numericAmount = parseCurrency(amount);
        if (numericAmount > 0) {
            onAddReminder(numericAmount, type, date);
            setIsEditing(false);
        }
    };

    return (
        <div className={`p-3 ${color} rounded-lg`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {icon}
                    <div>
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm">{description}</p>
                    </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(!isEditing)}>
                    Investir
                    <Lucide.ChevronDown size={20} className={`ml-1 transition-transform duration-300 ${isEditing ? 'rotate-180' : ''}`} />
                </Button>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isEditing ? 'max-h-56 mt-3' : 'max-h-0 mt-0'}`}>
                <div className="space-y-3 pt-1">
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="flex-grow">
                                <label className="block text-xs font-medium mb-1">Valor</label>
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                            <div className="w-24">
                                <label className="block text-xs font-medium mb-1">% do Saldo</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={percentage}
                                        onChange={handlePercentageChange}
                                        className="w-full pl-2 pr-5 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="0"
                                    />
                                    <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs pointer-events-none">%</span>
                                </div>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-medium mb-1">Data do Aporte</label>
                             <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center space-x-2 pt-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                            Cancelar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleAddReminder} leftIcon={<Lucide.BellPlus size={16} />}>
                            Lembrar
                        </Button>
                        <Button size="sm" variant="secondary" onClick={handleInvest} leftIcon={<Lucide.TrendingUp size={16} />}>
                            Investir Agora
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InvestmentPlanner: React.FC<InvestmentPlannerProps> = ({ balance, onInvest, onAddInvestmentReminder }) => {
    
    const canInvest = balance > 0;
    const personalSpending = canInvest ? balance * 0.15 : 0;
    const amountToInvest = balance - personalSpending;
    
    // Define allocation percentages
    const rendaFixaPercentage = 40;
    const rendaFixaLongoPrazoPercentage = 30;
    const rendaVariavelPercentage = 20;
    const criptoPercentage = 10;
    
    // NEW: State for compound interest calculator
    const [isCalculatorOpen, setIsCalculatorOpen] = React.useState(false);
    const [initialAmount, setInitialAmount] = React.useState(formatCurrency(balance));
    const [monthlyContribution, setMonthlyContribution] = React.useState(formatCurrency(200));
    const [interestRate, setInterestRate] = React.useState('8');
    const [period, setPeriod] = React.useState('10');
    const [projection, setProjection] = React.useState<{ data: any[], totalInvested: number, totalInterest: number, finalAmount: number } | null>(null);

    const { theme } = useTheme();

    // Effect to update initial amount when balance changes
    React.useEffect(() => {
        setInitialAmount(formatCurrency(balance));
    }, [balance]);

    const handleCurrencyInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setter('');
            return;
        }
        const numberValue = Number(value) / 100;
        setter(formatCurrency(numberValue));
    };

    const handlePlainNumberChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setter(value);
    };

    const handleCalculate = () => {
        const p = parseCurrency(initialAmount); // principal
        const pmt = parseCurrency(monthlyContribution); // monthly payment
        const r = parseFloat(interestRate) / 100; // annual rate
        const t = parseInt(period, 10); // years

        if (isNaN(p) || isNaN(pmt) || isNaN(r) || isNaN(t) || t <= 0 || r <= 0) {
            setProjection(null);
            return;
        }

        const monthlyRate = r / 12;
        const totalMonths = t * 12;
        let futureValue = p;
        let totalInvestedValue = p;
        const chartData = [];

        for (let month = 1; month <= totalMonths; month++) {
            futureValue *= (1 + monthlyRate);
            if (month > 0) {
                 futureValue += pmt;
                 totalInvestedValue += pmt;
            }

            if (month % 12 === 0 || month === totalMonths) {
                const year = Math.ceil(month / 12);
                const totalInterest = futureValue - totalInvestedValue;
                chartData.push({
                    name: `Ano ${year}`,
                    'Total Investido': totalInvestedValue,
                    'Juros Ganhos': totalInterest,
                });
            }
        }
        
        setProjection({
            data: chartData,
            totalInvested: totalInvestedValue,
            totalInterest: futureValue - totalInvestedValue,
            finalAmount: futureValue,
        });
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Planejador de Investimentos</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
                Uma sugestão de como alocar seu saldo para investir e também cuidar de você.
            </p>
            
            {canInvest ? (
                <div className="space-y-4 mb-6">
                    <div className="flex items-center p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                        <Lucide.Gift className="w-6 h-6 text-indigo-500 mr-4"/>
                        <div>
                            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-semibold">Uso Pessoal (15%)</p>
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(personalSpending)}</p>
                        </div>
                    </div>
                    
                    <InvestmentRow
                        type="Renda Fixa"
                        label="Reserva de Emergência"
                        balance={amountToInvest}
                        suggestedPercentage={rendaFixaPercentage}
                        description={`Sugestão: ${rendaFixaPercentage}% (Segurança)`}
                        icon={<Lucide.Shield className="w-6 h-6 text-blue-500 mr-4"/>}
                        color="bg-blue-50 dark:bg-blue-500/10"
                        onInvest={onInvest}
                        onAddReminder={onAddInvestmentReminder}
                    />
                    <InvestmentRow
                        type="Fundo de Renda Fixa"
                        label="Fundo de Renda Fixa"
                        balance={amountToInvest}
                        suggestedPercentage={rendaFixaLongoPrazoPercentage}
                        description={`Sugestão: ${rendaFixaLongoPrazoPercentage}% (Longo Prazo)`}
                        icon={<Lucide.Landmark className="w-6 h-6 text-purple-500 mr-4"/>}
                        color="bg-purple-50 dark:bg-purple-500/10"
                        onInvest={onInvest}
                        onAddReminder={onAddInvestmentReminder}
                    />
                    <InvestmentRow
                        type="Renda Variável"
                        label="Renda Variável"
                        balance={amountToInvest}
                        suggestedPercentage={rendaVariavelPercentage}
                        description={`Sugestão: ${rendaVariavelPercentage}% (Crescimento)`}
                        icon={<Lucide.TrendingUp className="w-6 h-6 text-green-500 mr-4"/>}
                        color="bg-green-50 dark:bg-green-500/10"
                        onInvest={onInvest}
                        onAddReminder={onAddInvestmentReminder}
                    />
                     <InvestmentRow
                        type="Criptomoedas"
                        label="Criptomoedas"
                        balance={amountToInvest}
                        suggestedPercentage={criptoPercentage}
                        description={`Sugestão: ${criptoPercentage}% (Alto Risco)`}
                        icon={<Lucide.Bitcoin className="w-6 h-6 text-amber-500 mr-4"/>}
                        color="bg-amber-50 dark:bg-amber-500/10"
                        onInvest={onInvest}
                        onAddReminder={onAddInvestmentReminder}
                    />
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-slate-700/40 rounded-lg mb-6">
                    <p className="text-slate-500 dark:text-slate-400">Seu saldo está negativo ou zerado.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Concentre-se em fechar o mês no azul para começar a planejar.</p>
                </div>
            )}
            
            {/* Compound Interest Calculator Section */}
             <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                    onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
                    className="w-full flex justify-between items-center text-left group"
                >
                    <div className="flex items-center">
                        <Lucide.Calculator className="w-6 h-6 text-primary mr-3" />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                            Calculadora de Juros Compostos
                        </h2>
                    </div>
                    <Lucide.ChevronDown 
                        size={24} 
                        className={`text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isCalculatorOpen ? 'rotate-180' : ''}`} 
                    />
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isCalculatorOpen ? 'max-h-[1000px] mt-6' : 'max-h-0'}`}>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                        Projete o crescimento do seu patrimônio ao longo do tempo.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Aporte Inicial</label>
                            <input type="text" value={initialAmount} onChange={handleCurrencyInputChange(setInitialAmount)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Aporte Mensal</label>
                            <input type="text" value={monthlyContribution} onChange={handleCurrencyInputChange(setMonthlyContribution)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Taxa de Juros (anual)</label>
                            <div className="relative">
                                <input type="text" value={interestRate} onChange={handlePlainNumberChange(setInterestRate)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                <span className="absolute inset-y-0 right-2 flex items-center text-slate-400 text-xs pointer-events-none">%</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Período (anos)</label>
                            <input type="text" value={period} onChange={handlePlainNumberChange(setPeriod)} className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                        </div>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                        <Button onClick={handleCalculate} leftIcon={<Lucide.BarChart2 size={16} />}>
                            Calcular Projeção
                        </Button>
                    </div>

                    {projection && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
                                <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Total Investido</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(projection.totalInvested)}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-lg">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">Juros Ganhos</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(projection.totalInterest)}</p>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">Valor Final</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(projection.finalAmount)}</p>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={projection.data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12 }} />
                                        <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tickFormatter={(tick) => `R$${tick/1000}k`} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value: number) => formatCurrency(value)}
                                            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                            contentStyle={{
                                                backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                                borderColor: theme === 'dark' ? '#475569' : '#e2e8f0',
                                                borderRadius: '0.5rem'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Total Investido" stackId="a" fill={theme === 'dark' ? '#60a5fa' : '#3b82f6'} />
                                        <Bar dataKey="Juros Ganhos" stackId="a" fill={theme === 'dark' ? '#34d399' : '#10b981'} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
             </div>
        </Card>
    );
};

export default InvestmentPlanner;
