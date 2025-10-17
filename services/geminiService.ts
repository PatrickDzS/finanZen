import type { Expense, Investment, Goal } from '../types';

const API_ENDPOINT = '/api/financial-advice';

// Mensagens de erro genéricas para o frontend
const FRONTEND_ERROR_MESSAGE = "### Erro\n\nDesculpe, não consegui entrar em contato com o assistente de IA. Por favor, verifique sua conexão ou tente novamente mais tarde.";

// Mensagens de erro específicas para quando a chave da API não está configurada no backend
const API_KEY_ERROR_MESSAGE = "### Erro de Configuração\n\nDesculpe, a chave da API do Google Gemini não foi configurada no ambiente de produção. O administrador do site precisa configurar esta chave para que as funcionalidades de IA funcionem.";

// Função auxiliar para fazer chamadas para nosso próprio backend
const fetchFromApi = async (body: object): Promise<{ success: boolean; isApiKeyError: boolean; data: string | null }> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("API proxy error:", responseData.error);
            // Verifica se o erro específico é de chave de API não configurada
            if (responseData.error === "API Key not configured.") {
                return { success: false, isApiKeyError: true, data: null };
            }
            return { success: false, isApiKeyError: false, data: null };
        }
        
        return { success: true, isApiKeyError: false, data: responseData.response };
    } catch (error) {
        console.error("Error fetching from API proxy:", error);
        return { success: false, isApiKeyError: false, data: null };
    }
};

export const getFinancialAdvice = async (
  income: number,
  expenses: Expense[]
): Promise<string> => {
    const result = await fetchFromApi({
        context: 'general',
        income,
        expenses
    });

    if (result.isApiKeyError) return API_KEY_ERROR_MESSAGE;
    if (!result.success || result.data === null) return FRONTEND_ERROR_MESSAGE;
    return result.data;
};

export const getInvestmentAdvice = async (
  income: number,
  expenses: Expense[],
  balance: number,
  investments: Investment[],
  goals: Goal[]
): Promise<string> => {
     const result = await fetchFromApi({
        context: 'investment',
        income,
        expenses,
        balance,
        investments,
        goals
    });
    
    if (result.isApiKeyError) return API_KEY_ERROR_MESSAGE;
    if (!result.success || result.data === null) return FRONTEND_ERROR_MESSAGE;
    return result.data;
};

export const getExpenseAnalysis = async (
  income: number,
  expenses: Expense[]
): Promise<string> => {
    const result = await fetchFromApi({
        context: 'expense_analysis',
        income,
        expenses,
    });
    
    if (result.isApiKeyError) return API_KEY_ERROR_MESSAGE;
    if (!result.success || result.data === null) return FRONTEND_ERROR_MESSAGE;
    return result.data;
};