export type Locale = "pl" | "en";

export const translations = {
    pl: {
        title: "Audyt SEO i SGE",
        subtitle: "Analiza pod kątem SEO i SGE",
        description: "Pobierz zaawansowany raport SEO, Performance i AI Overview (SGE). Przygotuj swoje treści na nową erę wyszukiwania konwersacyjnego.",
        urlPlaceholder: "Wpisz adres URL strony...",
        auditUrl: "Analizuj URL",
        auditSite: "Audyt całych witryn",
        siteWideLabel: "Audyt całej witryny (Crawl)",
        loading: "Analizuję...",
        resultsFor: "Wyniki dla:",
        downloadPdf: "Pobierz PDF",
        downloadMac: "Pobierz na macOS",
        backToAudit: "Wróć do analizy online",
        footer: "Juliusz Tomeczek &copy; {year} • w ramach projektu",

        // Scores
        scoreGeneral: "Ogólny wynik",
        scoreSeo: "SEO Techniczne",
        scorePerformance: "Performance",
        scoreAi: "AI Readiness",

        // Dictionary labels
        metaTitle: "Meta Tytuł",
        metaDesc: "Meta Opis",
        canonical: "Link Kanoniczny",
        headings: "Nagłówki H1-H3",
        images: "Obrazy (Alt)",
        links: "Linki (Wewnętrzne/Zewn.)",
        schema: "Dane Strukturalne (Schema)",
        wordCount: "Liczba słów",
        readability: "Czytelność",

        // Chat
        chatTitle: "Konsultant Gemini AI",
        chatRole: "Ekspert SEO",
        chatPlaceholder: "Zadaj pytanie...",
        chatThinking: "Gemini myśli...",
        chatIntro: "Zadaj mi pytanie na temat wyników tej podstrony. Chętnie doradzę, jak poprawić parametry!",
        chatSettings: "Ustawienia klucza API",
        chatKeyPlaceholder: "Wklej klucz API (AIza...)",
        chatKeySave: "Zapisz Klucz",
        chatKeyCancel: "Anuluj",
        chatKeyInfo: "W wersji Desktop używasz własnego klucza, aby nie mieć limitów zapytań.",
        chatKeyStorage: "Klucz jest zapisywany lokalnie na Twoim komputerze.",
        chatKeyRequired: "Wymagany klucz API do działania w wersji Desktop.",
        chatKeyConfig: "Skonfiguruj Klucz",

        // Download Page
        dlHeroBadge: "Wersja Profesjonalna dla macOS",
        dlHeroTitle: "Analizuj bez limitów na swoim Macu",
        dlHeroDesc: "Pobierz natywną aplikację Audyt SEO i SGE. Szybsza analiza, brak limitów zapytań i pełna prywatność danych dzięki pracy z własnym kluczem API.",
        dlButton: "Pobierz dla macOS (.dmg)",
        dlUpdateInfo: "Bezpłatna aktualizacja do v1.0.0",
        dlFeature1Title: "Brak Limitów",
        dlFeature1Desc: "Wersja desktopowa pozwala na nielimitowaną liczbę audytów dzięki użyciu własnego klucza Gemini.",
        dlFeature2Title: "Prywatność",
        dlFeature2Desc: "Twoje analizy i klucze API nie opuszczają Twojego komputera. Pełne bezpieczeństwo biznesowe.",
        dlFeature3Title: "Natywna Wydajność",
        dlFeature3Desc: "Szybsze przetwarzanie dużych witryn i lepsza stabilność niż w wersji przeglądarkowej.",
        dlInfoTitle: "Informacje o instalacji",
        dlInfo1: "Wymagany macOS 11.0 Big Sur lub nowszy",
        dlInfo2: "Wsparcie dla procesorów Apple Silicon (M1/M2/M3)",
        dlInfo3: "Wymaga własnego klucza Gemini API (dostępny bezpłatnie w Google AI Studio)",
        dlInfo4: "Aplikacja sama powiadomi Cię o dostępności nowych aktualizacji",
        dlStableVersion: "Aktualna wersja stabilna: v1.0.0",

        // Gemini System Instruction
        geminiSystem: (context: string) => `Jesteś ekspertem ds. SEO oraz AI Readiness (SGE). Twoim zadaniem jest pomóc użytkownikowi zrozumieć wyniki audytu jego strony internetowej i doradzić, jak może poprawić parametry analizowane przez aplikację.
        
Kontekst audytu:
${context}

Odpowiadaj konkretnie, profesjonalnie i w języku polskim. Skup się na danych zawartych w kontekście. Jeśli użytkownik pyta o coś poza zakresem audytu, dyplomatycznie skieruj go z powrotem na tematy związane z SEO i optymalizacją pod modele AI.`
    },
    en: {
        title: "SEO & SGE Auditor",
        subtitle: "SEO & SGE Analysis",
        description: "Download advanced SEO, Performance, and AI Overview (SGE) reports. Prepare your content for the new era of conversational search.",
        urlPlaceholder: "Enter page URL...",
        auditUrl: "Analyze URL",
        auditSite: "Site-wide Audit",
        siteWideLabel: "Full Site Audit (Crawl)",
        loading: "Analyzing...",
        resultsFor: "Results for:",
        downloadPdf: "Download PDF",
        downloadMac: "Download for macOS",
        backToAudit: "Back to online analysis",
        footer: "Juliusz Tomeczek &copy; {year} • part of the",

        // Scores
        scoreGeneral: "Overall Score",
        scoreSeo: "Technical SEO",
        scorePerformance: "Performance",
        scoreAi: "AI Readiness",

        // Dictionary labels
        metaTitle: "Meta Title",
        metaDesc: "Meta Description",
        canonical: "Canonical Link",
        headings: "Headings H1-H3",
        images: "Images (Alt)",
        links: "Links (Internal/Ext.)",
        schema: "Structured Data (Schema)",
        wordCount: "Word Count",
        readability: "Readability",

        // Chat
        chatTitle: "Gemini AI Consultant",
        chatRole: "SEO Expert",
        chatPlaceholder: "Ask a question...",
        chatThinking: "Gemini is thinking...",
        chatIntro: "Ask me a question about the results of this page. I'd be happy to advise on how to improve parameters!",
        chatSettings: "API Key Settings",
        chatKeyPlaceholder: "Paste API Key (AIza...)",
        chatKeySave: "Save Key",
        chatKeyCancel: "Cancel",
        chatKeyInfo: "In the Desktop version, you use your own key to avoid query limits.",
        chatKeyStorage: "The key is saved locally on your computer.",
        chatKeyRequired: "API key required for Desktop version.",
        chatKeyConfig: "Configure Key",

        // Download Page
        dlHeroBadge: "Professional Version for macOS",
        dlHeroTitle: "Analyze without limits on your Mac",
        dlHeroDesc: "Download the native SEO & SGE application. Faster analysis, no query limits, and full data privacy by using your own API key.",
        dlButton: "Download for macOS (.dmg)",
        dlUpdateInfo: "Free update to v1.0.0",
        dlFeature1Title: "No Limits",
        dlFeature1Desc: "The desktop version allows for an unlimited number of audits by using your own Gemini key.",
        dlFeature2Title: "Privacy",
        dlFeature2Desc: "Your analysis and API keys do not leave your computer. Full business security.",
        dlFeature3Title: "Native Performance",
        dlFeature3Desc: "Faster processing of large sites and better stability than the browser version.",
        dlInfoTitle: "Installation Info",
        dlInfo1: "macOS 11.0 Big Sur or later required",
        dlInfo2: "Apple Silicon (M1/M2/M3) support",
        dlInfo3: "Requires your own Gemini API key (available for free in Google AI Studio)",
        dlInfo4: "The app will notify you when new updates are available",
        dlStableVersion: "Current stable version: v1.0.0",

        // Gemini System Instruction
        geminiSystem: (context: string) => `You are an expert in SEO and AI Readiness (SGE). Your task is to help the user understand the audit results of their website and advise on how they can improve the parameters analyzed by the application.
        
Audit Context:
${context}

Respond specifically, professionally, and in English. Focus on the data contained in the context. If the user asks about something outside the audit scope, diplomatically direct them back to SEO and AI model optimization topics.`
    }
};
