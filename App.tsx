import * as React from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Expense, Investment, Achievement, Notification, User, Goal } from './types';

// Components
import Header from './components/Header';
import Navigation from './components/Navigation';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import LoadingPig from './components/ui/LoadingPig';
import Chatbot from './components/Chatbot';
import DashboardSummaryMetrics from './components/DashboardSummaryMetrics';
import ExpenseAnalysis from './components/GoalsSummaryChart';


// Modals
import AddExpenseModal from './components/AddExpenseModal';
import AddGoalModal from './components/AddGoalModal';
import { AddContributionModal } from './components/GoalsTracker';


// Pages/Views
import ZenScorePage from './components/ZenScorePage';
import ExpenseTracker from './components/ExpenseTracker';
import InvestmentPlanner from './components/InvestmentPlanner';
import Gamification from './components/Gamification';
import ProfilePage from './components/ProfilePage';
import FinancialFlow from './components/FinancialFlow';
import InvestmentHistory from './components/InvestmentHistory';
import NotificationManager from './components/NotificationManager';
import GoalsTracker from './components/GoalsTracker';
import GoalsHistory from './components/GoalsHistory';


// Mock Initial Data
const MOCK_DATA = {
  MOCK_EXPENSES: [
    { id: '1', name: 'Aluguel', amount: 1500, category: 'Moradia', dueDate: new Date(new Date().setDate(5)).toISOString().split('T')[0], icon: 'Home' },
    { id: '2', name: 'Supermercado', amount: 650, category: 'Alimentação', dueDate: new Date(new Date().setDate(1)).toISOString().split('T')[0], icon: 'ShoppingCart' },
    { id: '3', name: 'Conta de Luz', amount: 120, category: 'Contas', dueDate: new Date(new Date().setDate(10)).toISOString().split('T')[0], icon: 'ReceiptText' },
    { id: '4', name: 'Internet', amount: 99, category: 'Contas', dueDate: new Date(new Date().setDate(15)).toISOString().split('T')[0], icon: 'Wifi' },
    { id: '5', name: 'Plano de Saúde', amount: 450, category: 'Saúde', dueDate: new Date(new Date().setDate(20)).toISOString().split('T')[0], icon: 'HeartPulse' },
  ] as Expense[],
  MOCK_INVESTMENTS: [
    { id: 'i1', type: 'Renda Fixa', amount: 2000, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString() },
    { id: 'i2', type: 'Criptomoedas', amount: 500, date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString() },
  ] as Investment[],
  MOCK_ACHIEVEMENTS: [
    { id: 'a1', title: 'Primeiros Passos', description: 'Adicione sua primeira despesa.', unlocked: true, icon: 'PlusCircle' },
    { id: 'a2', title: 'Planejador', description: 'Crie sua primeira meta financeira.', unlocked: true, icon: 'Target' },
    { id: 'a3', title: 'Mês no Verde', description: 'Termine um mês com saldo positivo.', unlocked: false, icon: 'TrendingUp' },
    { id: 'a4', title: 'Investidor Iniciante', description: 'Faça seu primeiro investimento.', unlocked: true, icon: 'CandlestickChart' },
  ] as Achievement[],
  MOCK_GOALS: [
    { id: 'g1', name: 'Viagem para o Japão', target: 20000, currentAmount: 7500, deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0], icon: 'Plane', color: 'bg-cyan-500' },
    { id: 'g2', name: 'Reserva de Emergência', target: 15000, currentAmount: 15000, deadline: new Date().toISOString().split('T')[0], icon: 'ShieldCheck', color: 'bg-blue-500' },
    { id: 'g3', name: 'Novo Computador', target: 8000, currentAmount: 3200, deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0], icon: 'Package', color: 'bg-indigo-500' },
] as Goal[],
};

const { MOCK_EXPENSES, MOCK_INVESTMENTS, MOCK_ACHIEVEMENTS, MOCK_GOALS } = MOCK_DATA;

const App: React.FC = () => {
    // App State
    const [user, setUser] = useLocalStorage<User | null>('user', null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    
    // Financial State
    const [income, setIncome] = useLocalStorage<number>('income', 5000);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', MOCK_EXPENSES);
    const [investments, setInvestments] = useLocalStorage<Investment[]>('investments', MOCK_INVESTMENTS);
    const [goals, setGoals] = useLocalStorage<Goal[]>('goals', MOCK_GOALS);

    // Gamification & Notifications
    const [achievements, setAchievements] = useLocalStorage<Achievement[]>('achievements', MOCK_ACHIEVEMENTS);
    const [notifications, setNotifications] = useLocalStorage<Notification[]>('notifications', []);

    // Modal State
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = React.useState(false);
    const [expenseToEdit, setExpenseToEdit] = React.useState<Expense | null>(null);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = React.useState(false);
    const [goalToEdit, setGoalToEdit] = React.useState<Goal | null>(null);
    const [isAddContributionModalOpen, setIsAddContributionModalOpen] = React.useState(false);
    const [goalToContributeTo, setGoalToContributeTo] = React.useState<Goal | null>(null);

    // Derived State
    const totalExpenses = React.useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
    const balance = React.useMemo(() => income - totalExpenses, [income, totalExpenses]);

    // Routing
    const [hash, setHash] = React.useState(window.location.hash || '#/');
    React.useEffect(() => {
        const handleHashChange = () => {
            setHash(window.location.hash || '#/');
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    const activeTab = hash.split('/')[1] || 'dashboard';

    // --- Handlers ---

    const addNotification = (title: string, description: string) => {
        const newNotification: Notification = {
            id: new Date().toISOString(),
            title,
            description,
            date: new Date().toISOString(),
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const handleSaveExpense = (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
        if (expenseData.id) { // Editing
            setExpenses(prev => prev.map(e => e.id === expenseData.id ? { ...e, ...expenseData } : e));
            addNotification("Conta Atualizada", `Sua conta "${expenseData.name}" foi salva.`);
        } else { // Adding
            const newExpense: Expense = { ...expenseData, id: new Date().toISOString() };
            setExpenses(prev => [newExpense, ...prev]);
             addNotification("Nova Conta Adicionada", `"${newExpense.name}" no valor de R$${newExpense.amount.toFixed(2)}.`);
        }
        setIsAddExpenseModalOpen(false);
        setExpenseToEdit(null);
    };

    const handleEditExpense = (expense: Expense) => {
        setExpenseToEdit(expense);
        setIsAddExpenseModalOpen(true);
    };
    
    const handleDeleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
        addNotification("Conta Removida", "A conta foi removida com sucesso.");
    };
    
     const handleInvest = (amount: number, type: Investment['type'], date: string) => {
        const newInvestment: Investment = { id: new Date().toISOString(), amount, type, date };
        setInvestments(prev => [newInvestment, ...prev]);
        setIncome(prev => prev - amount); // Also deduct from main income/balance
        addNotification("Investimento Realizado", `Você investiu R$${amount.toFixed(2)} em ${type}.`);
    };

    const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'currentAmount'> & { id?: string }) => {
        if (goalData.id) { // Editing
            setGoals(prev => prev.map(g => g.id === goalData.id ? { ...g, ...goalData } : g));
            addNotification("Meta Atualizada", `Sua meta "${goalData.name}" foi salva.`);
        } else { // Adding
            const newGoal: Goal = { ...goalData, id: new Date().toISOString(), currentAmount: 0 };
            setGoals(prev => [newGoal, ...prev]);
            addNotification("Nova Meta Criada", `Você definiu a meta "${newGoal.name}".`);
        }
        setIsAddGoalModalOpen(false);
        setGoalToEdit(null);
    };

    const handleEditGoal = (goal: Goal) => {
        setGoalToEdit(goal);
        setIsAddGoalModalOpen(true);
    };
    
    const handleDeleteGoal = (id: string) => {
        setGoals(prev => prev.filter(g => g.id !== id));
        addNotification("Meta Removida", "A meta foi removida com sucesso.");
    };

    const handleOpenContributionModal = (goal: Goal) => {
        setGoalToContributeTo(goal);
        setIsAddContributionModalOpen(true);
    };

    const handleAddContribution = (goalId: string, amount: number) => {
        setGoals(prev => prev.map(g => {
            if (g.id === goalId) {
                const newAmount = g.currentAmount + amount;
                return { ...g, currentAmount: Math.min(newAmount, g.target) };
            }
            return g;
        }));
        setIncome(prev => prev - amount);
        addNotification("Aporte Realizado", `Você contribuiu R$${amount.toFixed(2)} para sua meta.`);
        setIsAddContributionModalOpen(false);
        setGoalToContributeTo(null);
    };

    // --- Auth ---
    React.useEffect(() => {
        // Simulate loading user data
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setHash('#/dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        // Clear all data on logout
        setIncome(0);
        setExpenses([]);
        setInvestments([]);
        setGoals([]);
        setNotifications([]);
        setAchievements(MOCK_ACHIEVEMENTS);
        window.location.hash = '#/';
    };

    // Render logic
    if (isLoading) {
        return <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900"><LoadingPig /></div>;
    }
    
    if (!user) {
        if (hash === '#/login') {
            return <LoginPage onLogin={handleLogin} />;
        }
        return <LandingPage />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'contas':
                return <ExpenseTracker expenses={expenses} deleteExpense={handleDeleteExpense} openAddExpenseModal={() => setIsAddExpenseModalOpen(true)} onEditExpense={handleEditExpense} />;
            case 'investimentos':
                return (
                    <div className="space-y-8">
                        <InvestmentPlanner balance={balance} onInvest={handleInvest} onAddInvestmentReminder={(amount, type, date) => addNotification("Lembrete de Investimento", `Lembrete para investir R$${amount.toFixed(2)} em ${type} no dia ${date}.`)} />
                    </div>
                );
            case 'metas':
                return <GoalsTracker goals={goals} onAddGoal={() => setIsAddGoalModalOpen(true)} onEditGoal={handleEditGoal} onDeleteGoal={handleDeleteGoal} onAddContribution={handleOpenContributionModal} />;
            case 'zenscore':
                return <ZenScorePage income={income} totalExpenses={totalExpenses} investments={investments} goals={goals} />;
            case 'conquistas':
                return <Gamification achievements={achievements} />;
            case 'perfil':
                 return <ProfilePage user={user} onUpdateProfile={setUser} onLogout={handleLogout} onChangePassword={(curr, next) => addNotification("Senha Alterada", "Sua senha foi alterada com sucesso.")} />;
            case 'dashboard':
            default:
                return (
                    <div className="space-y-8">
                        <DashboardSummaryMetrics income={income} setIncome={setIncome} totalExpenses={totalExpenses} balance={balance} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <FinancialFlow income={income} expenses={expenses} />
                                <ExpenseAnalysis income={income} expenses={expenses} />
                            </div>
                            <div className="lg:col-span-1 space-y-8">
                                <InvestmentHistory investments={investments} />
                                <GoalsHistory goals={goals} />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen">
            <Header notifications={notifications} setNotifications={setNotifications} onMenuToggle={() => setIsMobileMenuOpen(true)} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Navigation activeTab={activeTab} isMobileMenuOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <div className="page-content-enter">
                    {renderContent()}
                </div>
            </main>
            <Chatbot />
            <NotificationManager notifications={notifications} />

            {/* Modals */}
            <AddExpenseModal isOpen={isAddExpenseModalOpen} onClose={() => { setIsAddExpenseModalOpen(false); setExpenseToEdit(null); }} onSaveExpense={handleSaveExpense} expenseToEdit={expenseToEdit} />
            <AddGoalModal isOpen={isAddGoalModalOpen} onClose={() => { setIsAddGoalModalOpen(false); setGoalToEdit(null); }} onSaveGoal={handleSaveGoal} goalToEdit={goalToEdit} />
            <AddContributionModal isOpen={isAddContributionModalOpen} onClose={() => setIsAddContributionModalOpen(false)} onAddContribution={handleAddContribution} goal={goalToContributeTo} balance={balance} />
        </div>
    );
};

export default App;