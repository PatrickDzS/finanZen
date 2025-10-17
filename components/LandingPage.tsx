import * as React from 'react';
import * as Lucide from 'lucide-react';
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';

// FIX: Extended the IntersectionObserverInit type to include the custom `triggerOnce` property,
// as it is not part of the standard DOM type definition.
interface AnimateOnScrollOptions extends IntersectionObserverInit {
    triggerOnce?: boolean;
}

// Custom hook to detect when an element is in the viewport
const useAnimateOnScroll = (options: AnimateOnScrollOptions = { threshold: 0.1, triggerOnce: true }) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => {
        const currentRef = ref.current;
        if (!currentRef) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                // Stop observing after the animation has been triggered once
                // FIX: The `triggerOnce` property is now correctly recognized on the extended options type.
                if (options.triggerOnce) {
                    observer.unobserve(currentRef);
                }
            }
        }, options);

        observer.observe(currentRef);

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [options]);

    return [ref, isVisible] as const;
};

// Wrapper component to apply scroll-triggered animations
const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number; as?: React.ElementType }> = ({ children, className = '', delay = 0, as: Component = 'div' }) => {
    const [ref, isVisible] = useAnimateOnScroll();
    
    return (
        <Component
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </Component>
    );
};


const LandingHeader = () => {
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <a href="#/" className="flex items-center">
                        <Lucide.PiggyBank className="w-8 h-8 text-primary" />
                        <h1 className="ml-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                           FinanZen
                        </h1>
                    </a>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <a href="#/login">
                           <Button variant="ghost">Entrar</Button>
                        </a>
                         <a href="#/login">
                           <Button variant='primary' className="hidden sm:inline-flex shadow-lg shadow-primary/30">Criar conta grátis</Button>
                        </a>
                    </div>
                </div>
            </div>
        </header>
    );
};

const HeroSection = () => (
    <section className="relative text-center overflow-hidden bg-slate-50 dark:bg-slate-900">
         <div className="absolute inset-0 bg-grid-slate-200/[0.5] dark:bg-grid-slate-700/[0.2] [mask-image:linear-gradient(to_bottom,white__0%,transparent_100%)]"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-48 lg:pb-32">
            <AnimatedSection>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                   A tranquilidade financeira <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animated-gradient">começa aqui.</span>
                </h1>
            </AnimatedSection>
            <AnimatedSection delay={200}>
                <p className="mt-6 text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                    Assuma o controle dos seus gastos, planeje seu futuro e invista com confiança. O FinanZen é o seu guia pessoal para uma vida financeira mais saudável.
                </p>
            </AnimatedSection>
            <AnimatedSection delay={400}>
                <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <a href="#/login">
                       <Button size="lg" variant="primary" className="shadow-2xl shadow-primary/40 w-full sm:w-auto">
                           Criar minha conta grátis
                           <Lucide.ArrowRight size={20} className="ml-2" />
                       </Button>
                    </a>
                </div>
                 <div className="mt-6 flex justify-center items-center">
                    <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-50 dark:border-slate-900 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-bold text-slate-500">
                          <Lucide.User size={16}/>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-slate-50 dark:border-slate-900 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-bold text-slate-600">
                           <Lucide.UserCheck size={16}/>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-slate-50 dark:border-slate-900 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-xs font-bold text-white">
                           <Lucide.UserCog size={16}/>
                        </div>
                    </div>
                    <p className="ml-3 text-sm text-slate-500 dark:text-slate-400">
                        Junte-se a mais de <strong>10.000+</strong> usuários felizes.
                    </p>
                </div>
            </AnimatedSection>
        </div>
    </section>
);

const features = [
    {
        icon: 'ReceiptText',
        title: 'Controle de Despesas Inteligente',
        description: 'Registre seus gastos em segundos e veja para onde seu dinheiro está indo com gráficos claros e intuitivos.'
    },
    {
        icon: 'Target',
        title: 'Metas que Viram Realidade',
        description: 'Crie metas personalizadas, acompanhe seu progresso e receba orientações para alcançar seus sonhos mais rápido.'
    },
    {
        icon: 'TrendingUp',
        title: 'Investimentos Simplificados',
        description: 'Receba sugestões de alocação de investimentos com base no seu perfil e comece a construir seu patrimônio.'
    },
     {
        icon: 'Sparkles',
        title: 'Assistente IA ao seu Lado',
        description: 'Obtenha dicas financeiras e de investimentos personalizadas, geradas por uma IA que entende suas finanças.'
    }
]

const FeaturesSection = () => (
    <section id="features" className="py-20 lg:py-32 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <AnimatedSection as="h2" className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">Tudo o que você precisa, em um só lugar</AnimatedSection>
                <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    Ferramentas poderosas e fáceis de usar para você dominar suas finanças de uma vez por todas.
                </AnimatedSection>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => {
                    const FeatureIcon = Lucide[feature.icon as keyof typeof Lucide] as React.ElementType;
                    return (
                        <AnimatedSection key={index} delay={index * 150} className="text-center p-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
                                <FeatureIcon className="w-8 h-8 text-primary"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{feature.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400">{feature.description}</p>
                        </AnimatedSection>
                    )
                })}
            </div>
        </div>
    </section>
);

const HowItWorksSection = () => (
    <section id="how-it-works" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <AnimatedSection as="h2" className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">Veja como é fácil começar</AnimatedSection>
                <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    Em poucos minutos, você estará no caminho certo para uma vida financeira mais organizada e próspera.
                </AnimatedSection>
            </div>
            <AnimatedSection className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-full aspect-video bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-cover bg-center bg-[url('https://i.imgur.com/7b7d1vj.png')]">
                         <div className="absolute inset-0 bg-black/40"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 video-play-button">
                             <Lucide.Play size={40} className="text-white fill-white" style={{marginLeft: '4px'}}/>
                        </div>
                        <p className="mt-4 font-semibold text-lg">Veja a Simplicidade em Ação</p>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    </section>
);


const testimonials = [
    {
        name: 'Camila Alves',
        role: 'Designer de Produto',
        quote: 'Finalmente uma ferramenta que não me intimida! A gamificação me mantém motivada e o assistente de IA me deu dicas que eu nunca teria pensado sozinha.',
        avatar: 'User',
        rating: 5,
    },
    {
        name: 'João Pedro',
        role: 'Desenvolvedor',
        quote: 'Como alguém que ama dados, os gráficos são fantásticos. É a primeira vez que sinto que tenho controle total sobre minhas finanças e metas de investimento.',
        avatar: 'UserCheck',
        rating: 5,
    },
    {
        name: 'Mariana Costa',
        role: 'Empreendedora',
        quote: 'O FinanZen mudou o jogo para mim. Consigo separar as finanças da minha empresa das pessoais e planejar o futuro com muito mais clareza. Recomendo!',
        avatar: 'UserCog',
        rating: 5,
    }
];

const TestimonialsSection = () => (
    <section id="testimonials" className="py-20 lg:py-32 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                 <AnimatedSection as="h2" className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">Feito para Pessoas Reais, Resultados Reais</AnimatedSection>
                 <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    Não acredite apenas na nossa palavra. Veja como o FinanZen está transformando a vida financeira de nossos usuários.
                 </AnimatedSection>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => {
                     const AvatarIcon = Lucide[testimonial.avatar as keyof typeof Lucide] as React.ElementType;
                     return (
                        <AnimatedSection key={index} delay={index * 150} as="figure" className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="flex-grow">
                                <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <Lucide.Star key={i} size={16} className="fill-current" />
                                    ))}
                                </div>
                                <Lucide.Quote className="w-8 h-8 text-primary/30" />
                                <blockquote className="mt-4 text-slate-600 dark:text-slate-300 text-lg">
                                    <p>"{testimonial.quote}"</p>
                                </blockquote>
                            </div>
                            <figcaption className="mt-6 flex items-center">
                                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mr-4 ring-4 ring-white dark:ring-slate-800/50">
                                     <AvatarIcon className="text-white" size={28} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{testimonial.name}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</div>
                                </div>
                            </figcaption>
                        </AnimatedSection>
                     )
                })}
            </div>
        </div>
    </section>
);

const PricingSection = () => (
    <section id="pricing" className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <AnimatedSection as="h2" className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">Planos para todos os bolsos</AnimatedSection>
                <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                    Comece de graça e evolua quando estiver pronto. Simples, transparente e sem surpresas.
                </AnimatedSection>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Free Plan Card */}
                <AnimatedSection delay={100} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gratuito</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">O essencial para você começar a organizar sua vida financeira.</p>
                    <div className="mt-6">
                        <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">R$0</span>
                        <span className="text-slate-500 dark:text-slate-400">/para sempre</span>
                    </div>
                    <ul className="mt-8 space-y-4 flex-grow text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Controle de Despesas Essencial</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Criação de Metas Financeiras</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Visão Geral do Orçamento</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Gamificação e Conquistas</span></li>
                    </ul>
                    <div className="mt-8">
                        <a href="#/login">
                           <Button variant="ghost" className="w-full">Criar conta grátis</Button>
                        </a>
                    </div>
                </AnimatedSection>

                {/* Premium Plan Card */}
                <AnimatedSection delay={200} className="relative border-2 border-primary rounded-2xl p-8 flex flex-col bg-white dark:bg-slate-800/50 shadow-2xl shadow-primary/20">
                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                        <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">Mais Popular</div>
                    </div>
                    <h3 className="text-2xl font-bold text-primary">Premium</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">O poder da IA para acelerar seus resultados e otimizar seus investimentos.</p>
                    <div className="mt-6">
                        <span className="text-4xl font-bold text-slate-900 dark:text-slate-50">R$19,90</span>
                        <span className="text-slate-500 dark:text-slate-400">/mês</span>
                    </div>
                    <ul className="mt-8 space-y-4 flex-grow text-slate-600 dark:text-slate-300">
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span><strong>Tudo do plano Gratuito</strong></span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Conselheiro IA Ilimitado</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Planejador de Investimentos</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Relatórios Detalhados</span></li>
                        <li className="flex items-center gap-3"><Lucide.CheckCircle2 size={20} className="text-secondary flex-shrink-0" /><span>Lembretes Personalizados</span></li>
                    </ul>
                    <div className="mt-8">
                        <a href="#/login">
                           <Button variant="primary" className="w-full">Experimentar o Premium</Button>
                        </a>
                    </div>
                </AnimatedSection>
            </div>
            
            <AnimatedSection delay={300} className="mt-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">
                    <Lucide.ShieldCheck size={16} />
                    <span>Sua jornada financeira começa sem riscos.</span>
                </div>
                <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Experimente todo o potencial do plano <strong>Premium por 7 dias, totalmente grátis</strong>. Se não for para você, sem problemas. Você pode continuar usando o plano gratuito para sempre.
                </p>
            </AnimatedSection>
        </div>
    </section>
);


const faqs = [
    {
        question: 'O FinanZen é realmente gratuito?',
        answer: 'Sim! O FinanZen oferece um plano gratuito completo com todas as funcionalidades essenciais para você organizar suas finanças. Não pedimos cartão de crédito para o cadastro.'
    },
    {
        question: 'Meus dados financeiros estão seguros?',
        answer: 'Absolutamente. A segurança dos seus dados é nossa maior prioridade. Utilizamos criptografia de ponta e as melhores práticas de segurança para garantir que suas informações estejam sempre protegidas.'
    },
    {
        question: 'Como o assistente de IA funciona?',
        answer: 'Nosso assistente de IA, baseado na tecnologia do Google, analisa seus dados de forma anônima para identificar padrões e oferecer insights personalizados. Ele pode sugerir onde cortar gastos, como otimizar seus investimentos e te ajudar a alcançar suas metas mais rápido.'
    },
    {
        question: 'Posso usar o FinanZen em múltiplos dispositivos?',
        answer: 'Sim. O FinanZen é uma aplicação web responsiva, o que significa que você pode acessá-la confortavelmente do seu computador, tablet ou celular, mantendo seus dados sempre sincronizados.'
    }
]

const FAQItem: React.FC<{ faq: { question: string, answer: string }, isOpen: boolean, onClick: () => void }> = ({ faq, isOpen, onClick }) => {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 py-4">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left"
            >
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">{faq.question}</span>
                <Lucide.ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                <p className="text-slate-600 dark:text-slate-400 pr-8">{faq.answer}</p>
            </div>
        </div>
    );
};

const FAQSection = () => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="py-20 lg:py-32 bg-white dark:bg-slate-800/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <AnimatedSection as="h2" className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">Perguntas Frequentes</AnimatedSection>
                    <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                        Tudo o que você precisa saber antes de começar.
                    </AnimatedSection>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <AnimatedSection key={index} delay={index * 100}>
                             <FAQItem
                                faq={faq}
                                isOpen={openIndex === index}
                                onClick={() => handleClick(index)}
                            />
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
};


const CTASection = () => (
    <section className="py-20 lg:py-32 bg-slate-100 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection as="h2" className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-slate-50">Pronto para assumir o controle da sua vida financeira?</AnimatedSection>
            <AnimatedSection as="p" delay={150} className="mt-4 text-lg text-slate-600 dark:text-slate-400">Junte-se a milhares de usuários que estão transformando seus futuros com o FinanZen.</AnimatedSection>
            <AnimatedSection delay={300} className="mt-8">
                 <a href="#/login">
                    <Button size="lg" variant="secondary" className="shadow-lg shadow-secondary/30">
                        Comece agora, de graça
                    </Button>
                </a>
            </AnimatedSection>
        </div>
    </section>
);


const LandingFooter = () => (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                     <a href="#/" className="flex items-center">
                        <Lucide.PiggyBank className="w-8 h-8 text-primary" />
                        <h1 className="ml-3 text-2xl font-bold text-slate-800 dark:text-slate-100">
                           FinanZen
                        </h1>
                    </a>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                        Seu guia pessoal para uma vida financeira mais saudável e tranquila.
                    </p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider uppercase">Navegação</h3>
                    <ul className="mt-4 space-y-2">
                        <li><a href="#features" className="text-base text-slate-500 dark:text-slate-400 hover:text-primary">Funcionalidades</a></li>
                        <li><a href="#how-it-works" className="text-base text-slate-500 dark:text-slate-400 hover:text-primary">Como Funciona</a></li>
                        <li><a href="#testimonials" className="text-base text-slate-500 dark:text-slate-400 hover:text-primary">Avaliações</a></li>
                        <li><a href="#faq" className="text-base text-slate-500 dark:text-slate-400 hover:text-primary">FAQ</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider uppercase">Contato</h3>
                    <ul className="mt-4 space-y-2">
                        <li><a href="mailto:contato@finanzen.com" className="text-base text-slate-500 dark:text-slate-400 hover:text-primary">contato@finanzen.com</a></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider uppercase">Redes Sociais</h3>
                    <div className="flex space-x-4 mt-4">
                        <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary"><Lucide.Twitter size={24} /></a>
                        <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary"><Lucide.Instagram size={24} /></a>
                        <a href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary"><Lucide.Linkedin size={24} /></a>
                    </div>
                </div>
            </div>
             <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} FinanZen. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
);


const LandingPage = () => {
    return (
        <div className="bg-white dark:bg-slate-900">
            <LandingHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <TestimonialsSection />
                <PricingSection />
                <FAQSection />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
    );
};

export default LandingPage;