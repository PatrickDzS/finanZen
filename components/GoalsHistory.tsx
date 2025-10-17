import * as React from 'react';
import Card from './ui/Card';
import type { Goal } from '../types';
import * as Lucide from 'lucide-react';
import { iconMap } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Simplified Goal Item for dashboard view
const GoalHistoryItem: React.FC<{ goal: Goal }> = ({ goal }) => {
    const { theme } = useTheme();
    const progress = goal.target > 0 ? Math.min(((goal.currentAmount || 0) / goal.target) * 100, 100) : 0;
    const isCompleted = progress >= 100;
    const IconComponent = iconMap[goal.icon] || iconMap['Target'];
    
    const colorMap: { [key: string]: string } = {
        'bg-blue-500': theme === 'dark' ? '#60a5fa' : '#3b82f6',
        'bg-green-500': theme === 'dark' ? '#34d399' : '#22c55e',
        'bg-indigo-500': theme === 'dark' ? '#818cf8' : '#6366f1',
        'bg-amber-500': theme === 'dark' ? '#fbbF24' : '#f59e0b',
        'bg-purple-500': theme === 'dark' ? '#c084fc' : '#a855f7',
        'bg-pink-500': theme === 'dark' ? '#f472b6' : '#ec4899',
        'bg-red-500': theme === 'dark' ? '#f87171' : '#ef4444',
        'bg-cyan-500': theme === 'dark' ? '#22d3ee' : '#06b6d4',
        'bg-teal-500': theme === 'dark' ? '#2dd4bf' : '#14b8a6',
    };

    const secondaryColor = theme === 'dark' ? '#34d399' : '#10b981';
    const progressColorHex = isCompleted ? secondaryColor : (colorMap[goal.color] || '#6b7280');
    const iconColorClass = goal.color.replace('bg-', 'text-');
    const iconBgColorClass = goal.color.replace('bg-', 'bg-') + '/10';
    
    return (
        <div className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors duration-200">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 ${isCompleted ? 'bg-secondary/10' : iconBgColorClass}`}>
                <IconComponent className={`w-5 h-5 ${isCompleted ? 'text-secondary' : iconColorClass}`} />
            </div>
            <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={goal.name}>{goal.name}</p>
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-300 flex-shrink-0 ml-2">{`${Math.round(progress)}%`}</span>
                </div>
                 <div title={`${formatCurrency(goal.currentAmount || 0)} / ${formatCurrency(goal.target)}`} className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                    <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: progressColorHex }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

// Main Component
const GoalsHistory: React.FC<{ goals: Goal[] }> = ({ goals }) => {
    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Lucide.Target className="w-6 h-6 text-primary mr-3" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumo das Metas</h2>
                </div>
            </div>
            <div className="space-y-3 pr-2 -mr-4 max-h-[350px] overflow-y-auto">
                {goals.length > 0 ? (
                    goals.map(goal => <GoalHistoryItem key={goal.id} goal={goal} />)
                ) : (
                    <div className="text-center py-10">
                        <Lucide.Target size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Nenhuma meta criada.</p>
                        <a href="#/metas" className="text-sm text-primary hover:underline">Crie sua primeira meta</a>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default GoalsHistory;