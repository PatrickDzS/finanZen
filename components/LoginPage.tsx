import * as React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import * as Lucide from 'lucide-react';
import type { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login - in a real app, this would be an API call
        if (email.trim() && password.trim()) {
            onLogin({ email, name: 'Usuário FinanZen' }); // Use a default name on login
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 px-4">
            <div className="w-full max-w-md">
                 <div className="flex justify-center items-center mb-6">
                    <Lucide.PiggyBank className="w-12 h-12 text-primary" />
                    <h1 className="ml-4 text-4xl font-bold text-slate-800 dark:text-slate-100">
                        Finanzen
                    </h1>
                </div>
                <Card className="shadow-2xl">
                    <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-2">Bem-vindo de volta!</h2>
                    <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Acesse sua conta para continuar.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    aria-required="true"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="voce@exemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password"className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                                Senha
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    aria-required="true"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"/>
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 dark:text-slate-300">
                                    Lembrar-me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary/80">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button type="submit" className="w-full">
                                Entrar
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;