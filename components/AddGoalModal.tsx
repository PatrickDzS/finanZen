import * as React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import type { Goal } from '../types';
import { GOAL_SUGGESTIONS, iconMap, SELECTABLE_GOAL_ICONS, SELECTABLE_GOAL_COLORS } from '../constants';
import * as Lucide from 'lucide-react';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveGoal: (goal: Omit<Goal, 'id' | 'currentAmount'> & { id?: string }) => void;
    goalToEdit?: Goal | null;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSaveGoal, goalToEdit }) => {
    const [name, setName] = React.useState('');
    const [targetAmount, setTargetAmount] = React.useState('');
    const [deadline, setDeadline] = React.useState('');
    const [selectedIcon, setSelectedIcon] = React.useState(GOAL_SUGGESTIONS[0].icon);
    const [selectedColor, setSelectedColor] = React.useState(GOAL_SUGGESTIONS[0].bgColor);
    const [reminderDays, setReminderDays] = React.useState(0);
    
    const isEditing = !!goalToEdit;

    React.useEffect(() => {
        if (isOpen) {
            if (goalToEdit) {
                setName(goalToEdit.name);
                setTargetAmount(formatCurrency(goalToEdit.target));
                setDeadline(goalToEdit.deadline);
                setSelectedIcon(goalToEdit.icon);
                setSelectedColor(goalToEdit.color);
                setReminderDays(goalToEdit.reminderDays || 0);
            } else {
                const defaultSuggestion = GOAL_SUGGESTIONS[0];
                setName('');
                setTargetAmount('');
                setDeadline('');
                setSelectedIcon(defaultSuggestion.icon);
                setSelectedColor(defaultSuggestion.bgColor);
                setReminderDays(0);
            }
        }
    }, [isOpen, goalToEdit]);
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value === '') {
            setTargetAmount('');
            return;
        }
        const numberValue = Number(value) / 100;
        setTargetAmount(formatCurrency(numberValue));
    };
    
    const handleSuggestionClick = (suggestion: { name: string; icon: string; bgColor: string }) => {
        setName(suggestion.name);
        setSelectedIcon(suggestion.icon);
        setSelectedColor(suggestion.bgColor);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const rawValue = targetAmount.replace(/[R$\.\s]/g, '').replace(',', '.');
        const numericAmount = parseFloat(rawValue);

        if (!name || isNaN(numericAmount) || numericAmount <= 0 || !selectedIcon || !selectedColor || !deadline) return;
        
        onSaveGoal({
            id: goalToEdit?.id,
            name,
            target: numericAmount,
            deadline,
            icon: selectedIcon,
            color: selectedColor,
            reminderDays,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Meta" : "Adicionar Meta"}>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 -mr-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Sugestões</label>
                    <div className="flex flex-wrap gap-2">
                        {GOAL_SUGGESTIONS.map(suggestion => {
                            const IconComponent = iconMap[suggestion.icon];
                            const isSelected = name === suggestion.name;
                            return (
                                <button
                                    type="button"
                                    key={suggestion.name}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`px-3 py-2 text-sm rounded-full flex items-center transition-all duration-200 ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                >
                                    <IconComponent size={16} className="mr-2" />
                                    {suggestion.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label htmlFor="goal-name" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Nome da Meta</label>
                    <input id="goal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="goal-amount" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Valor Alvo</label>
                        <input id="goal-amount" type="text" value={targetAmount} onChange={handleAmountChange} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="R$ 0,00" required />
                    </div>
                    <div>
                        <label htmlFor="goal-deadline" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Prazo Final</label>
                        <input id="goal-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                    </div>
                </div>

                 <div>
                    <label htmlFor="reminder" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Lembrete</label>
                    <select id="reminder" value={reminderDays} onChange={(e) => setReminderDays(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                        <option value={0}>Não lembrar</option>
                        <option value={3}>3 dias antes</option>
                        <option value={7}>7 dias antes</option>
                        <option value={15}>15 dias antes</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Ícone</label>
                     <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        {SELECTABLE_GOAL_ICONS.map(iconName => {
                            const IconComponent = iconMap[iconName] || Lucide.Package;
                            const isSelected = selectedIcon === iconName;
                            return (
                                <button type="button" key={iconName} onClick={() => setSelectedIcon(iconName)} className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${isSelected ? 'bg-primary text-white scale-110 shadow-md' : 'bg-white dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'}`} title={iconName}>
                                    <IconComponent size={20} />
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Cor</label>
                     <div className="flex flex-wrap gap-3">
                         {SELECTABLE_GOAL_COLORS.map(colorClass => {
                            const isSelected = selectedColor === colorClass;
                            return (
                                <button type="button" key={colorClass} onClick={() => setSelectedColor(colorClass)} className={`w-8 h-8 rounded-full transition-all duration-200 ${colorClass} ${isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-primary' : ''}`} aria-label={colorClass}>
                                     {isSelected && (
                                        <span className="flex items-center justify-center h-full">
                                            <Lucide.Check size={16} className="text-white"/>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit">{isEditing ? "Salvar Alterações" : "Adicionar Meta"}</Button>
                </div>
            </form>
            </div>
        </Modal>
    );
};

export default AddGoalModal;