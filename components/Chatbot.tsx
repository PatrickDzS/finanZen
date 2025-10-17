import * as React from 'react';
import * as Lucide from 'lucide-react';
import type { ChatMessage } from '../types';
import { getWorkflowResponse } from '../services/chatbotService';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5 p-3">
        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full typing-dot"></div>
        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full typing-dot"></div>
        <div className="w-2.5 h-2.5 bg-slate-400 rounded-full typing-dot"></div>
    </div>
);

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsLoading(true);
            setTimeout(() => {
                setMessages([
                    {
                        id: generateId(),
                        text: 'Olá! Sou seu assistente financeiro. Como posso te ajudar a organizar suas finanças hoje?',
                        sender: 'bot'
                    }
                ]);
                setIsLoading(false);
            }, 1000);
        }
    }, [isOpen, messages.length]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (inputValue.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: generateId(),
            text: inputValue,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        const botResponseText = await getWorkflowResponse(messages, inputValue);
        
        const botMessage: ChatMessage = {
            id: generateId(),
            text: botResponseText,
            sender: 'bot',
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {/* Chat Window */}
            <div className={`fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] max-w-sm z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col h-[60vh] max-h-[500px] border border-slate-200 dark:border-slate-700 chat-window-enter">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="flex items-center">
                            <Lucide.Sparkles className="w-6 h-6 text-primary mr-2" />
                            <h3 className="font-bold text-slate-800 dark:text-slate-100">Assistente FinanZen</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <Lucide.X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${
                                msg.sender === 'user' 
                                ? 'justify-end message-sent-enter' 
                                : 'justify-start message-received-enter'
                            }`}>
                                {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Lucide.Sparkles className="w-5 h-5 text-primary" /></div>}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex items-end gap-2 justify-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Lucide.Sparkles className="w-5 h-5 text-primary" /></div>
                                 <div className="rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-700">
                                    <TypingIndicator />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Digite sua dúvida..."
                                className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || inputValue.trim() === ''} className="w-10 h-10 flex-shrink-0 bg-primary text-white rounded-full flex items-center justify-center transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90">
                                <Lucide.Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-6 right-4 sm:right-6 z-50 w-16 h-16 bg-primary rounded-full text-white shadow-lg flex items-center justify-center transform transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                aria-label="Abrir assistente IA"
            >
                <Lucide.MessageSquare size={28} className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} style={{ position: 'absolute' }} />
                <Lucide.X size={28} className={`transition-transform duration-300 ${isOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} style={{ position: 'absolute' }} />
            </button>
        </>
    );
};

export default Chatbot;