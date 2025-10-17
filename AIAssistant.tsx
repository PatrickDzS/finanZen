import * as React from 'react';
import Modal from './ui/Modal';
import { getFinancialAdvice, getInvestmentAdvice } from '../services/geminiService';
import type { Expense, Investment, Goal } from '../types';
import * as Lucide from 'lucide-react';
import LoadingPig from './ui/LoadingPig';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    income: number;
    expenses: Expense[];
    balance: number;
    goals: Goal[];
    investments: Investment[];
    context: 'general' | 'investment';
}

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="mb-5">
        <div className="flex items-center mb-2">
            <div className="p-1.5 bg-primary/10 rounded-full mr-3">{icon}</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
        </div>
        <div className="pl-10 text-slate-500 dark:text-slate-400 space-y-2">{children}</div>
    </div>
);

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const sections = content.split('### ').filter(s => s.trim() !== '');

    const iconMap: { [key: string]: React.ReactNode } = {
        'Diagnóstico Rápido': <Lucide.BarChart2 size={20} className="text-primary" />,
        'Ponto de Atenção (1 Dica)': <Lucide.AlertTriangle size={20} className="text-primary" />,
        'Plano de Ação para o Saldo': <Lucide.Target size={20} className="text-primary" />,
        'Análise do seu Perfil': <Lucide.UserCheck size={20} className="text-primary" />,
        'Estratégia Sugerida': <Lucide.PieChart size={20} className="text-primary" />,
        'Próximos Passos': <Lucide.StepForward size={20} className="text-primary" />,
        'Lembrete Final': <Lucide.Zap size={20} className="text-primary" />,
    };

    return (
        <div>
            {sections.map((section, index) => {
                const [title, ...bodyParts] = section.split('\n');
                const body = bodyParts.join('\n').trim();
                const cleanTitle = title.trim().replace(/ para R\$ \d+,\d+$/, ''); // Clean title for icon mapping
                const icon = iconMap[cleanTitle] || <Lucide.Sparkles size={20} className="text-primary" />;


                return (
                    <Section key={index} title={title.trim()} icon={icon}>
                         {body.split('\n').filter(line => line.trim() !== '').map((line, lineIndex) => {
                            if (line.startsWith('- ') || line.startsWith('* ')) {
                                 const boldRegex = /\*\*(.*?)\*\*/g;
                                 const parts = line.substring(2).split(boldRegex);

                                return (
                                    <p key={lineIndex} className="flex">
                                        <span className="mr-2 text-primary">•</span>
                                        <span>
                                            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-700 dark:text-slate-200">{part}</strong> : part)}
                                        </span>
                                    </p>
                                );
                            }
                            // Support for numbered lists
                            if (/^\d+\.\s/.test(line)) {
                                return (
                                    <p key={lineIndex} className="flex">
                                        <span className="mr-2 text-primary">{line.substring(0, 2)}</span>
                                        <span>{line.substring(2).trim()}</span>
                                    </p>
                                );
                            }
                            return <p key={lineIndex}>{line}</p>
                         })}
                    </Section>
                );
            })}
        </div>
    );
};


const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, income, expenses, balance, goals, investments, context }) => {
    const [advice, setAdvice] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const fetchAdvice = React.useCallback(async () => {
        if (income === 0 && expenses.length === 0) {
            setAdvice("### Alerta\nPor favor, adicione sua renda e alguns gastos para que eu possa te dar um conselho personalizado.");
            return;
        }
        setIsLoading(true);
        try {
            let result;
            if (context === 'investment') {
                 if (balance <= 0) {
                     result = "### Comece a Poupar\nSeu saldo está negativo ou zerado. Para investir, o primeiro passo é ter um saldo positivo. Concentre-se em reduzir despesas para começar a investir no próximo mês!";
                } else {
                    result = await getInvestmentAdvice(income, expenses, balance, investments, goals);
                }
            } else {
                result = await getFinancialAdvice(income, expenses);
            }
            setAdvice(result);
        } catch (error) {
            setAdvice("### Erro\nOcorreu um erro ao buscar o conselho. Tente novamente mais tarde.");
        } finally {
            setIsLoading(false);
        }
    }, [income, expenses, balance, investments, goals, context]);

    React.useEffect(() => {
        if (isOpen) {
            // Clear previous advice to prevent flickering of old content
            setAdvice('');
            fetchAdvice();
        }
    // The dependency array is corrected to include fetchAdvice. This ensures
    // the effect re-runs if income or expenses change, preventing stale data.
    }, [isOpen, fetchAdvice]);

    return (
         <Modal isOpen={isOpen} onClose={onClose} title="Conselheiro Financeiro IA">
            <div className="max-h-[70vh] overflow-y-auto p-1 pr-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                        <LoadingPig />
                        <p className="mt-4 text-slate-500 dark:text-slate-400 font-semibold loading-text-pulse">Analisando suas finanças...</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 loading-text-pulse" style={{ animationDelay: '300ms' }}>Nosso especialista está criando um plano financeiro exclusivo para você.</p>
                    </div>
                ) : (
                   <MarkdownRenderer content={advice} />
                )}
            </div>
        </Modal>
    );
};

export default AIAssistant;