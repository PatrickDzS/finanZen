export default async (req: any, res: any) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    // Fallback for local development if the environment variable is not set.
    if (!n8nWebhookUrl) {
        console.warn('N8N_WEBHOOK_URL environment variable is not set. Falling back to local development URL.');
        n8nWebhookUrl = 'http://localhost:5678/webhook/1c253718-2d82-4789-a570-2acb82758b58';
    }

    try {
        const { chatHistory, userPrompt } = req.body;

        // Forward the request to the n8n webhook
        const n8nResponse = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                history: chatHistory,
                prompt: userPrompt
            }),
        });
        
        if (!n8nResponse.ok) {
            const errorText = await n8nResponse.text();
            console.error(`Error from n8n webhook: ${n8nResponse.status} ${errorText}`);
            return res.status(502).json({ error: 'Failed to get response from the chatbot workflow.' });
        }
        
        const n8nData = await n8nResponse.json();
        
        // Defensively check for the response text from common n8n response structures.
        const responseText = n8nData?.[0]?.json?.text 
            || n8nData?.response 
            || "Desculpe, não consegui processar a resposta do fluxo de trabalho.";

        res.status(200).json({ response: responseText });

    } catch (error: any) {
        console.error("Error calling n8n webhook:", error);
        // Check for fetch error related to localhost not being available
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
             console.error('Connection refused. Is the local n8n instance running?');
             return res.status(504).json({ error: 'Could not connect to the local n8n workflow. Please ensure it is running.' });
        }
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
};
