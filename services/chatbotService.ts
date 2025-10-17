import type { ChatMessage } from '../types';

const API_ENDPOINT = '/api/chatbot-workflow';

const WORKFLOW_NOT_CONFIGURED_MESSAGE = "Desculpe, o fluxo de trabalho do chatbot não está configurado. O administrador precisa verificar a URL do webhook do n8n.";
const WORKFLOW_ERROR_MESSAGE = "Oops! Tive um probleminha para me comunicar com meu fluxo de trabalho. Pode tentar de novo?";

export const getWorkflowResponse = async (
    history: ChatMessage[],
    prompt: string
): Promise<string> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatHistory: history,
                userPrompt: prompt
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("Chatbot workflow API error:", responseData.error);
            if (responseData.error === "Chatbot workflow is not configured.") {
                return WORKFLOW_NOT_CONFIGURED_MESSAGE;
            }
            return WORKFLOW_ERROR_MESSAGE;
        }

        return responseData.response.trim();

    } catch (error) {
        console.error("Error fetching from chatbot workflow API:", error);
        return WORKFLOW_ERROR_MESSAGE;
    }
};
