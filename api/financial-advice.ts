import { GoogleGenAI } from "@google/genai";

// Tipos locais para evitar problemas de importação de caminho na função serverless
interface Expense { id: string; name: string; amount: number; category: string; dueDate: string; }
interface Goal { id: string; name: string; target: number; currentAmount: number; deadline: string; }
interface Investment { id: string; type: 'Renda Fixa' | 'Renda Variável' | 'Criptomoedas' | 'Fundo de Renda Fixa'; amount: number; }

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default async (req: any, res: any) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.API_KEY) {
        console.error("Vercel Environment Error: API_KEY is not configured.");
        return res.status(500).json({ error: "API Key not configured." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelName = "gemini-2.5-flash";

        const { context, income, expenses, balance, investments, goals } = req.body;
        
        let prompt;
        const config = {};

        switch (context) {
            case 'general': {
                const totalExpenses = expenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0);
                const finalBalance = income - totalExpenses;
                const expenseDetails = expenses.map((e: Expense) => `- ${e.name} (${e.category}): ${formatCurrency(e.amount)}`).join('\n');
                prompt = `
                  ### Análise Financeira para o FinanZen

                  **Contexto:** Você é um conselheiro financeiro especialista em finanças pessoais para o público brasileiro. Seu tom é encorajador, prático e fácil de entender. Use markdown para formatação com títulos (###), listas (-) e negrito (**).

                  **Dados do Usuário:**
                  - **Renda Mensal:** ${formatCurrency(income)}
                  - **Total de Despesas:** ${formatCurrency(totalExpenses)}
                  - **Saldo Final:** ${formatCurrency(finalBalance)}
                  - **Detalhes das Despesas:**
                  ${expenseDetails || 'Nenhuma despesa registrada.'}

                  **Sua Tarefa:**
                  Forneça uma análise concisa e acionável em 3 seções:

                  1.  **### Diagnóstico Rápido**
                      - Dê um resumo em uma frase sobre a saúde financeira atual do usuário (ex: "Suas finanças estão saudáveis, com um bom saldo positivo.", "Atenção, suas despesas estão maiores que a renda.").
                      - Mencione o valor do saldo final.

                  2.  **### Ponto de Atenção (1 Dica)**
                      - Identifique a **maior categoria de despesa** ou um ponto de melhoria claro. Se não houver despesas, sugira começar a registrá-las.
                      - Dê **uma dica prática e específica** para otimizar os gastos nessa área. Exemplo: "Seus gastos com Alimentação são o maior ponto. Tente planejar as refeições da semana para reduzir pedidos por delivery."

                  3.  **### Plano de Ação para o Saldo**
                      - Com base no saldo (${formatCurrency(finalBalance)}), sugira o que fazer.
                      - Se o saldo for **positivo**: Sugira dividir o valor entre **uma meta de curto prazo** (como criar uma reserva de emergência) e **um pequeno luxo** como recompensa pelo bom trabalho.
                      - Se o saldo for **negativo**: Dê uma sugestão encorajadora para revisar despesas menores e encontrar pequenos cortes para reverter a situação no próximo mês.

                  **Formato da Resposta:** Use EXATAMENTE este formato de markdown. Não adicione introduções ou conclusões.
                `;
                break;
            }
            case 'expense_analysis': {
                const expenseDetails = expenses.map((e: Expense) => `- ${e.name} (${e.category}): ${formatCurrency(e.amount)}`).join('\n');
                prompt = `
                  ### Análise de Otimização de Despesas para o FinanZen

                  **Contexto:** Você é um consultor financeiro amigável e prático. Sua missão é ajudar o usuário a economizar dinheiro analisando seus gastos. Use um tom positivo e encorajador.

                  **Dados do Usuário:**
                  - **Renda Mensal:** ${formatCurrency(income)}
                  - **Despesas:**
                  ${expenseDetails || 'Nenhuma despesa registrada.'}

                  **Sua Tarefa:**
                  Forneça uma análise focada em otimização, com dicas práticas.

                  1.  **### Principais Áreas de Gasto**
                      - Identifique as **duas maiores categorias** de despesas do usuário.
                      - Apresente-as em uma lista, mostrando o nome da categoria e o valor total gasto.

                  2.  **### Dicas para Reduzir Despesas**
                      - Para **cada uma das duas categorias** identificadas, forneça **duas dicas práticas e criativas** para reduzir os gastos. As dicas devem ser específicas para o contexto brasileiro.
                      - Formate como uma lista, com o nome da categoria em negrito. Exemplo:
                        - **Alimentação:**
                          - Dica 1...
                          - Dica 2...
                        - **Transporte:**
                          - Dica 1...
                          - Dica 2...

                  3.  **### Dica de Ouro**
                      - Forneça uma dica geral e inteligente de economia que o usuário pode aplicar no dia a dia, não necessariamente ligada a uma categoria específica.

                  **Formato da Resposta:** Use EXATAMENTE este formato de markdown. Não adicione saudações ou despedidas.
                `;
                break;
            }
            case 'investment': {
                const investmentDetails = investments.length > 0 ? investments.map((i: Investment) => `${i.type}: ${formatCurrency(i.amount)}`).join(', ') : 'Nenhum investimento registrado.';
                const goalDetails = goals.length > 0 ? goals.map((g: Goal) => `- ${g.name} (Meta: ${formatCurrency(g.target)}, Atual: ${formatCurrency(g.currentAmount)})`).join('\n') : 'Nenhuma meta registrada.';

                prompt = `
                  ### Análise de Investimentos para o FinanZen

                  **Contexto:** Você é um consultor de investimentos para iniciantes no Brasil. Seu objetivo é dar o próximo passo de forma clara e segura, sem jargões complexos.

                  **Dados do Usuário:**
                  - **Renda Mensal:** ${formatCurrency(income)}
                  - **Saldo Mensal (Potencial de Aporte):** ${formatCurrency(balance)}
                  - **Investimentos Atuais:** ${investmentDetails}
                  - **Metas Financeiras:**
                  ${goalDetails}

                  **Sua Tarefa:**
                  Forneça um conselho de investimento em 3 seções, usando markdown.

                  1.  **### Análise do seu Perfil**
                      - Com base nos dados (saldo, metas), descreva o perfil do usuário em uma frase (ex: "Você está começando sua jornada de investidor com um bom potencial de aporte mensal e metas claras.").

                  2.  **### Estratégia Sugerida para ${formatCurrency(balance)}**
                      - Se o usuário tiver a meta "Reserva de Emergência" e ela não estiver completa, priorize-a. Sugira alocar 100% do saldo para isso em um investimento de alta liquidez e baixo risco (Tesouro Selic ou um bom CDB 100% CDI).
                      - Se a reserva de emergência estiver completa ou não for uma meta, sugira diversificar o aporte entre as outras metas, se houver, ou iniciar em Renda Variável com uma pequena porcentagem (10-20%) para aprendizado.
                      - Se o usuário já tiver investimentos, reforce a importância de garantir que a reserva de emergência está completa antes de partir para investimentos mais arrojados.

                  3.  **### Próximos Passos**
                      - Dê **dois passos práticos** que o usuário pode tomar agora.
                      - Exemplo: "1. Abra conta em uma corretora que não cobre taxas de custódia (ex: NuInvest, Inter). 2. Transfira o valor e faça sua primeira aplicação em Tesouro Selic para sua reserva de emergência."

                  **Lembrete Final:** Adicione uma seção "### Lembrete Final" com o texto: "Lembre-se: este é um conselho educacional. A decisão final de investimento é sempre sua."
                `;
                break;
            }
            default:
                return res.status(400).json({ error: "Invalid context provided." });
        }
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config,
        });
        
        res.status(200).json({ response: response.text });

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: `Failed to get response from AI: ${error.message}` });
    }
};