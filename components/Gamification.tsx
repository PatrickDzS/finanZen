import * as React from 'react';
import Card from './ui/Card';
import type { Achievement } from '../types';
import { iconMap } from '../constants';
import * as Lucide from 'lucide-react';

// Sub-component for individual achievement
interface AchievementCardProps {
    achievement: Achievement;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
    const { title, description, unlocked, icon } = achievement;
    const IconComponent = iconMap[icon] || Lucide.Award;

    const unlockedClasses = 'bg-white dark:bg-slate-800 shadow-lg border-primary/50';
    const lockedClasses = 'bg-slate-50 dark:bg-slate-800/50 border-transparent';
    const unlockedIconContainer = 'bg-primary/10';
    const lockedIconContainer = 'bg-slate-200 dark:bg-slate-700';
    const unlockedIcon = 'text-primary';
    const lockedIcon = 'text-slate-400 dark:text-slate-500';

    return (
        <div className={`flex items-start p-4 rounded-xl border-2 transition-all duration-300 ${unlocked ? unlockedClasses : lockedClasses}`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors duration-300 ${unlocked ? unlockedIconContainer : lockedIconContainer}`}>
                <IconComponent className={`w-6 h-6 transition-colors duration-300 ${unlocked ? unlockedIcon : lockedIcon}`} />
            </div>
            <div className="flex-grow">
                <h3 className={`font-bold text-lg ${unlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{title}</h3>
                <p className={`text-sm ${unlocked ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{description}</p>
            </div>
            {unlocked && (
                <div className="flex-shrink-0 ml-4">
                    <Lucide.CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
            )}
        </div>
    );
};


// Main Gamification component
interface GamificationProps {
    achievements: Achievement[];
}

const Gamification: React.FC<GamificationProps> = ({ achievements }) => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                 <div className="flex items-center mb-4 sm:mb-0">
                    <Lucide.Trophy className="w-8 h-8 text-primary mr-3" />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Minhas Conquistas</h1>
                        <p className="text-slate-500 dark:text-slate-400">Complete desafios e desbloqueie recompensas.</p>
                    </div>
                </div>
            </div>

            <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Progresso das Conquistas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">{unlockedCount} de {totalCount} desbloqueadas</p>
                <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                    <div 
                        key={achievement.id}
                        className="achievement-item-enter"
                        style={{ animationDelay: `${index * 75}ms` }}
                    >
                        <AchievementCard achievement={achievement} />
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default Gamification;