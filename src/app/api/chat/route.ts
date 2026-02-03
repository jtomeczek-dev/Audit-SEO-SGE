import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { messages, context, lang = "pl" } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            const errorMsg = lang === "pl"
                ? 'Brak klucza API Gemini (GEMINI_API_KEY). Skontaktuj się z administratorem.'
                : 'Gemini API key (GEMINI_API_KEY) missing. Please contact the administrator.';
            return NextResponse.json({ error: errorMsg }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
        }, { apiVersion: 'v1beta' });

        const systemInstruction = lang === "pl"
            ? `Jesteś ekspertem ds. SEO oraz AI Readiness (SGE). Twoim zadaniem jest pomóc użytkownikowi zrozumieć wyniki audytu jego strony internetowej i doradzić, jak może poprawić parametry analizowane przez aplikację.

Kontekst audytu:
${JSON.stringify(context, null, 2)}

Zasady odpowiedzi:
1. Odpowiadaj konkretnie, profesjonalnie i w języku polskim.
2. Skup się na danych zawartych w kontekście.
3. **Używaj formatowania Markdown**:
   - Stosuj **pogrubienie** dla kluczowych terminów, parametrów i wartości.
   - Używaj list punktowanych (* lub -) dla zaleceń i wyliczeń.
   - Stosuj przejrzyste akapity.
4. Jeśli użytkownik pyta o coś poza zakresem audytu, dyplomatycznie skieruj go z powrotem na tematy związane z SEO i optymalizacją pod modele AI.`
            : `You are an expert in SEO and AI Readiness (SGE). Your task is to help the user understand their website audit results and advise on how to improve parameters analyzed by the application.

Audit Context:
${JSON.stringify(context, null, 2)}

Response Rules:
1. Respond concretely, professionally, and in English.
2. Focus on the data provided in the context.
3. **Use Markdown formatting**:
   - Use **bold** for key terms, parameters, and values.
   - Use bulleted lists (* or -) for recommendations and enumerations.
   - Use clear paragraphs.
4. If the user asks about something outside the audit scope, diplomatically steer them back to topics related to SEO and AI optimization.`;

        const initialAssistantMessage = lang === "pl"
            ? "Zrozumiałem. Jestem Twoim konsultantem Gemini AI, ekspertem ds. SEO i AI Readiness. Przeanalizowałem dostarczone dane audytu i jestem gotowy pomóc Ci zoptymalizować tę stronę. O co chciałbyś zapytać w pierwszej kolejności?"
            : "Understood. I am your Gemini AI consultant, an expert in SEO and AI Readiness. I have analyzed the provided audit data and am ready to help you optimize this page. What would you like to ask first?";

        // Prepend system instruction to history for v1 compatibility
        const history = [
            {
                role: 'user',
                parts: [{ text: `KONTEKST I INSTRUKCJA / CONTEXT AND INSTRUCTION: ${systemInstruction}` }],
            },
            {
                role: 'model',
                parts: [{ text: initialAssistantMessage }],
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
