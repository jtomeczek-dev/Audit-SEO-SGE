import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Brak klucza API Gemini (GEMINI_API_KEY). Skontaktuj się z administratorem.' }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
        }, { apiVersion: 'v1beta' });

        const systemInstruction = `Jesteś ekspertem ds. SEO oraz AI Readiness (SGE). Twoim zadaniem jest pomóc użytkownikowi zrozumieć wyniki audytu jego strony internetowej i doradzić, jak może poprawić parametry analizowane przez aplikację.

Kontekst audytu:
${JSON.stringify(context, null, 2)}

Zasady odpowiedzi:
1. Odpowiadaj konkretnie, profesjonalnie i w języku polskim.
2. Skup się na danych zawartych w kontekście.
3. **Używaj formatowania Markdown**:
   - Stosuj **pogrubienie** dla kluczowych terminów, parametrów i wartości.
   - Używaj list punktowanych (* lub -) dla zaleceń i wyliczeń.
   - Stosuj przejrzyste akapity.
4. Jeśli użytkownik pyta o coś poza zakresem audytu, dyplomatycznie skieruj go z powrotem na tematy związane z SEO i optymalizacją pod modele AI.`;

        // Prepend system instruction to history for v1 compatibility
        const history = [
            {
                role: 'user',
                parts: [{ text: `KONTEKST I INSTRUKCJA (Pamiętaj o tym przez całą rozmowę): ${systemInstruction}` }],
            },
            {
                role: 'model',
                parts: [{ text: "Zrozumiałem. Jestem Twoim konsultantem Gemini AI, ekspertem ds. SEO i AI Readiness. Przeanalizowałem dostarczone dane audytu i jestem gotowy pomóc Ci zoptymalizować tę stronę. O co chciałbyś zapytać w pierwszej kolejności?" }],
            },
            ...messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }))
        ];

        const chat = model.startChat({ history });

        const lastMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(lastMessage);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: 'assistant', content: text });
    } catch (error: any) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
