import * as React from 'react';
import * as Lucide from 'lucide-react';

const LoadingPig: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
                <div className="piggy-bob">
                    <Lucide.PiggyBank className="w-16 h-16 text-primary" />
                </div>
                <div className="absolute bottom-0 left-1/2 w-16 h-2 -translate-x-1/2 bg-slate-900/50 dark:bg-slate-900/80 rounded-full shadow-pulse" />
            </div>
            <p className="mt-6 font-semibold text-slate-600 dark:text-slate-300">Carregando...</p>
        </div>
    );
};

export default LoadingPig;
