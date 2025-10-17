import * as React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { Expense } from '../types';
import { EXPENSE_CATEGORIES, SELECTABLE_ICONS, iconMap } from '../constants';
import * as Lucide from 'lucide-react';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveExpense: (expense: Omit<Expense, 'id'> & { id?: string }) => void;
    expenseToEdit?: Expense | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onSaveExpense, expenseToEdit }) => {
    const [name, setName] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [category, setCategory] = React.useState(EXPENSE_CATEGORIES[0].name);
    const [icon, setIcon] = React.useState(EXPENSE_CATEGORIES[0].icon);
    const [dueDate, setDueDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [reminderDays, setReminderDays] = React.useState(0);
    const [showDueDateReward, setShowDueDateReward] = React.useState(false);

    const isEditing = !!expenseToEdit;

    // Effect to handle form state for both add and edit modes
    React.useEffect(() => {
        if (isOpen) {
            setShowDueDateReward(false);
            if (expenseToEdit) {
                const categoryInfo = EXPENSE_CATEGORIES.find(c => c.name === expenseToEdit.category);
                setName(expenseToEdit.name);
                setAmount(formatCurrency(expenseToEdit.amount));
                setCategory(expenseToEdit.category);
                setDueDate(expenseToEdit.dueDate);
                setReminderDays(expenseToEdit.reminderDays || 0);
                // Set the custom icon if it exists, otherwise fall back to the category's icon
                setIcon(expenseToEdit.icon || categoryInfo?.icon || 'Package');
            } else {
                // Reset form for adding a new expense
                const defaultCategory = EXPENSE_CATEGORIES[0];
                setName('');
                setAmount('');
                setCategory(defaultCategory.name);
                setIcon(defaultCategory.icon);
                setDueDate(new Date().toISOString().split('T')[0]);
                setReminderDays(0);
            }
        }
    }, [isOpen, expenseToEdit]);

    // Effect to update the icon automatically when the category changes (for new expenses only)
    React.useEffect(() => {
        if (!isEditing) {
            const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.name === category);
            if (categoryInfo) {
                setIcon(categoryInfo.icon);
            }
        }
    }, [category, isEditing]);

    // Effect for due date reward
    React.useEffect(() => {
        if (!dueDate || isEditing) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(dueDate);
        selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
        selectedDate.setHours(0, 0, 0, 0);
        const diffTime = selectedDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 7) {
            setShowDueDateReward(true);
            const timer = setTimeout(() => setShowDueDateReward(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [dueDate, isEditing]);

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
        const rawValue = amount.replace(/[R$\.\s]/g, '').replace(',', '.');
        const numericAmount = parseFloat(rawValue);

        if (!name || !amount || isNaN(numericAmount) || numericAmount <= 0 || !category || !dueDate || !icon) return;

        onSaveExpense({
            id: expenseToEdit?.id,
            name,
            amount: numericAmount,
            category,
            icon,
            dueDate,
            reminderDays,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Conta" : "Adicionar Conta"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Descrição</label>
                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Valor</label>
                        <input id="amount" type="text" value={amount} onChange={handleAmountChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="R$ 0,00" required />
                    </div>
                    <div className="relative">
                        <label htmlFor="dueDate" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Vencimento</label>
                        <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                        {showDueDateReward && (<div className="reward-animation absolute -top-7 right-0 flex items-center px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold rounded-full"><Lucide.Star size={12} className="mr-1 fill-current" />+10 Pontos Bônus!</div>)}
                    </div>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Categoria</label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required>
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Ícone</label>
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        {SELECTABLE_ICONS.map(iconName => {
                            const IconComponent = iconMap[iconName] || Lucide.Package;
                            const isSelected = icon === iconName;
                            return (
                                <button
                                    type="button"
                                    key={iconName}
                                    onClick={() => setIcon(iconName)}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${isSelected ? 'bg-primary text-white scale-110 shadow-md' : 'bg-white dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'}`}
                                    title={iconName}
                                >
                                    <IconComponent size={20} />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label htmlFor="reminder" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Lembrete</label>
                    <select id="reminder" value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value={0}>Não lembrar</option>
                        <option value={1}>1 dia antes</option>
                        <option value={3}>3 dias antes</option>
                        <option value={5}>5 dias antes</option>
                        <option value={7}>7 dias antes</option>
                    </select>
                </div>
                <div className="flex justify-end pt-2">
                    <Button type="submit">{isEditing ? "Salvar Alterações" : "Adicionar Conta"}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddExpenseModal;