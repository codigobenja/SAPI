export interface SentimentResponse {
    prevision: string;
    probabilidad: number;
    modelVersion?: string;
}

export const analyzeSentiment = async (text: string): Promise<SentimentResponse> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/sentiment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error('Error al analizar el sentimiento');
    }

    return response.json();
};

export const analyzeSentimentBatch = async (texts: string[]): Promise<SentimentResponse[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/sentiment/batch`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
        throw new Error('Error al analizar el lote de sentimientos');
    }

    return response.json();
};
