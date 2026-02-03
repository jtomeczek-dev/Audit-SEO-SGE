# Audyt SEO i SGE

Profesjonalne narzędzie do wnikliwej analizy technicznej stron internetowych, optymalizacji pod kątem tradycyjnych wyszukiwarek (SEO) oraz systemów nowej generacji (Google SGE / AI Readiness).

## 🚀 Główne Funkcje

- **Pełny Audyt Techniczny:** Analiza tagów meta, struktury nagłówków H1-H6, obrazów (ALT) oraz wydajności.
- **AI Readiness (SGE):** Ocena gotowości treści na potrzeby systemów Search Generative Experience.
- **Interaktywny Konsultant Gemini AI:** Wbudowany czat, który potrafi analizować wyniki audytu i doradzać konkretne poprawki.
- **Eksport do PDF:** Generowanie profesjonalnych raportów biznesowych z pełnym wsparciem polskich znaków.
- **Analiza Całych Serwisów:** Funkcja crawlowania witryny w celu znalezienia błędów na wielu podstronach jednocześnie.

## 🛠️ Stos Technologiczny

- **Framework:** Next.js 15+ (App Router)
- **Język:** TypeScript
- **Stylizacja:** Tailwind CSS
- **AI:** Google Gemini API (@google/generative-ai)
- **PDF:** jsPDF + jspdf-autotable
- **UI/UX:** Framer Motion, Lucide React

## 📋 Instalacja i Uruchomienie

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/jtomeczek-dev/Audit-SEO-SGE.git
   cd Audit-SEO-SGE
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Skonfiguruj zmienne środowiskowe:**
   Utwórz plik `.env.local` w głównym katalogu i dodaj swój klucz API:
   ```env
   GEMINI_API_KEY=twój_klucz_api
   ```

4. **Uruchom wersję deweloperską:**
   ```bash
   npm run dev
   ```

## 🔒 Bezpieczeństwo

Aplikacja jest zaprojektowana z myślą o bezpieczeństwie:
- Klucze API są przechowywane wyłącznie po stronie serwera.
- Plik `.env.local` jest wykluczony z systemu kontroli wersji (git).
- Wszystkie wejścia użytkownika są walidowane pod kątem poprawności URL.

## 📝 Autor

Projekt stworzony przez **Juliusz Tomeczek** w ramach projektu [AIforEveryone.blog](https://aiforeveryone.blog).
