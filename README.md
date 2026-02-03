# SEO and SGE Audit

Professional tool for deep technical analysis of websites, optimized for traditional search engines (SEO) and next-generation systems (Google SGE / AI Readiness).

## 🚀 Main Features

- **Full Technical Audit:** Analysis of meta tags, H1-H6 header structure, images (ALT), and performance.
- **AI Readiness (SGE):** Assessing content readiness for Search Generative Experience systems.
- **Interactive Gemini AI Consultant:** Built-in chat that can analyze audit results and advise on specific fixes.
- **Multi-language Support:** Full interface and AI support for both Polish and English.
- **Export to PDF:** Generation of professional business reports with full character support.
- **Site-wide Analysis:** Website crawling feature to find errors on multiple pages simultaneously.

## 🛠️ Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini API (@google/generative-ai)
- **PDF:** jsPDF + jspdf-autotable
- **UI/UX:** Framer Motion, Lucide React

## 📋 Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jtomeczek-dev/Audit-SEO-SGE.git
   cd Audit-SEO-SGE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your_api_key
   ```

4. **Run development version:**
   ```bash
   npm run dev
   ```

## 🔒 Security

The application is designed with security in mind:
- API keys are stored exclusively on the server side (for web version).
- The `.env.local` file is excluded from version control (git).
- All user inputs are validated for URL correctness.

## 📝 Author

Project created by **Juliusz Tomeczek** as part of the [AIforEveryone.blog](https://aiforeveryone.blog) project.
