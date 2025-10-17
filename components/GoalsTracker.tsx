import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { Goal } from '../types';
import { iconMap } from '../constants';
import * as Lucide from 'lucide-react';
import Confetti from './ui/Confetti';
import Modal from './ui/Modal';
import { useTheme } from '../contexts/ThemeContext';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
const parseCurrency = (value: string) => parseFloat(value.replace(/[R$\.\s]/g, '').replace(',', '.')) || 0;


interface AddContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddContribution: (goalId: string, amount: number) => void;
    goal: Goal | null;
    balance: number;
}

export const AddContributionModal: React.FC<AddContributionModalProps> = ({ isOpen, onClose, onAddContribution, goal, balance }) => {
    const [amount, setAmount] = React.useState('');

    React.useEffect(() => {
        if (!isOpen) {
            setAmount('');
        }
    }, [isOpen]);

    if (!goal) return null;

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setAmount('');
            return;
        }
        const numberValue = Number(value) / 100;
        setAmount(formatCurrency(numberValue));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrency(amount);
        if (numericAmount > 0) {
            onAddContribution(goal.id, numericAmount);
        }
    };
    
    const remainingAmount = goal.target - (goal.currentAmount || 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Aportar em "${goal.name}"`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Progresso Atual</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(goal.currentAmount || 0)} / {formatCurrency(goal.target)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                        Faltam {formatCurrency(remainingAmount > 0 ? remainingAmount : 0)}
                    </p>
                </div>
                 <div>
                    <div className="flex justify-between items-baseline">
                        <label htmlFor="contribution-amount" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Valor do Aporte</label>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Saldo disponível: {formatCurrency(balance)}</span>
                    </div>
                    <input
                        id="contribution-amount"
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-lg text-center"
                        placeholder="R$ 0,00"
                        required
                        autoFocus
                    />
                </div>
                 <div className="flex justify-end pt-2">
                    <Button type="submit" variant="secondary" disabled={parseCurrency(amount) <= 0 || parseCurrency(amount) > balance}>Contribuir</Button>
                </div>
            </form>
        </Modal>
    );
};


interface GoalsTrackerProps {
    goals: Goal[];
    onAddGoal?: () => void;
    onEditGoal?: (goal: Goal) => void;
    onDeleteGoal?: (id: string) => void;
    onAddContribution: (goal: Goal) => void;
}

const GoalItem: React.FC<{ goal: Goal; onEdit?: () => void; onDelete?: () => void; onContribute: () => void; }> = ({ goal, onEdit, onDelete, onContribute }) => {
    const { theme } = useTheme();
    const progress = goal.target > 0 ? Math.min(((goal.currentAmount || 0) / goal.target) * 100, 100) : 0;
    const isCompleted = progress >= 100;
    
    const [animatedProgress, setAnimatedProgress] = React.useState(0);
    const [showConfetti, setShowConfetti] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setAnimatedProgress(progress), 100);
        return () => clearTimeout(timer);
    }, [progress]);

    React.useEffect(() => {
        if (isCompleted) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 4000); // Confetti duration + buffer
            return () => clearTimeout(timer);
        }
    }, [isCompleted]);

    const IconComponent = iconMap[goal.icon] || iconMap['Target'];
    
    const colorMap: { [key: string]: string } = {
        'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-indigo-500': '#6366f1',
        'bg-amber-500': '#f59e0b', 'bg-purple-500': '#a855f7', 'bg-pink-500': '#ec4899',
        'bg-red-500': '#ef4444', 'bg-cyan-500': '#06b6d4', 'bg-teal-500': '#14b8a6',
    };
    const secondaryColor = '#10b981';
    const progressColorHex = isCompleted ? secondaryColor : (colorMap[goal.color] || '#6b7280');
    
    const guidanceText = React.useMemo(() => {
        if (!goal.deadline || isCompleted) return null;
        const remainingAmount = goal.target - (goal.currentAmount || 0);
        if (remainingAmount <= 0) return null;

        const deadlineDate = new Date(goal.deadline);
        deadlineDate.setMinutes(deadlineDate.getMinutes() + deadlineDate.getTimezoneOffset());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (deadlineDate < today) return "Prazo da meta expirado.";
        let monthsRemaining = (deadlineDate.getFullYear() - today.getFullYear()) * 12 - today.getMonth() + deadlineDate.getMonth();
        if (monthsRemaining <= 0) monthsRemaining = 1;
        
        const monthlySavings = remainingAmount / monthsRemaining;
        return `Poupe ${formatCurrency(monthlySavings)}/mês para atingir.`;
    }, [goal, isCompleted]);

    return (
        <div className={`relative group flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 transition-all duration-300 border-l-4 ${isCompleted ? 'goal-completed-glow' : 'hover:shadow-md'}`} style={{ borderColor: progressColorHex }}>
            {showConfetti && <Confetti />}
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-secondary/10' : goal.color.replace('bg-', 'bg-') + '/10'}`}>
                        <span className={isCompleted ? 'goal-completed-icon-jump' : ''}>
                           <IconComponent className={`w-6 h-6 ${isCompleted ? 'text-secondary' : goal.color.replace('bg-', 'text-')}`} />
                        </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (<button onClick={onEdit} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary transition-transform hover:scale-125"><Lucide.Edit size={16} /></button>)}
                        {onDelete && (<button onClick={onDelete} className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 transition-transform hover:scale-125"><Lucide.Trash2 size={16} /></button>)}
                    </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-3 truncate">{goal.name}</h3>
                
                <div className="flex justify-between items-baseline text-sm text-slate-500 dark:text-slate-400 mt-2">
                    <span title="Valor Atual">{formatCurrency(goal.currentAmount || 0)}</span>
                    <span title="Valor Alvo" className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(goal.target)}</span>
                </div>
                
                <div className="relative mt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                        <div className="h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${animatedProgress}%`, backgroundColor: progressColorHex }}></div>
                    </div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-lighten">{`${Math.round(progress)}%`}</span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                {guidanceText ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{guidanceText}</p>
                ) : <div />}
                {!isCompleted && (
                    <Button size="sm" variant="secondary" onClick={onContribute}>
                        <Lucide.Plus size={16} className="mr-1 -ml-1" /> Aportar
                    </Button>
                )}
            </div>
        </div>
    );
};

const GoalsTracker: React.FC<GoalsTrackerProps> = ({ goals, onAddGoal, onEditGoal, onDeleteGoal, onAddContribution }) => {
    const isEditable = !!(onAddGoal && onEditGoal && onDeleteGoal);

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Lucide.Target className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Metas Financeiras</h2>
                </div>
                 {isEditable && (
                    <Button onClick={onAddGoal} size="sm" variant="ghost" leftIcon={<Lucide.PlusCircle size={16} />}>
                        Nova Meta
                    </Button>
                )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
               {isEditable ? "Crie e gerencie suas metas para planejar seu futuro." : "Acompanhe o progresso das suas metas."}
            </p>
            {goals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map((goal, index) => (
                        <div 
                            key={goal.id} 
                            className="goal-item-enter" 
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <GoalItem 
                                goal={goal} 
                                onEdit={isEditable ? () => onEditGoal?.(goal) : undefined}
                                onDelete={isEditable ? () => onDeleteGoal?.(goal.id) : undefined}
                                onContribute={() => onAddContribution(goal)}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-slate-800/30 rounded-lg">
                    <Lucide.FlagOff size={40} className="mx-auto text-slate-400 dark:text-slate-500"/>
                    <p className="mt-4 font-semibold text-slate-600 dark:text-slate-300">Nenhuma meta definida ainda.</p>
                     {isEditable && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Clique em "Nova Meta" para começar a planejar seu futuro.</p>}
                </div>
            )}
        </Card>
    );
};

export default GoalsTracker;