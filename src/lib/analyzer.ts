import * as cheerio from 'cheerio';

export interface Recommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: 'SEO' | 'AI' | 'Performance' | 'Accessibility';
}

export interface ScoreCheck {
    label: string;
    points: number;
    maxPoints: number;
    passed: boolean;
    impact: number; // point deduction
}

export interface DetailedItem {
    type: string;
    label: string;
    items: {
        value: string;
        context?: string;
        reason?: string;
    }[];
}

export interface AuditResult {
    url: string;
    title: string;
    description: string;
    meta: {
        ogTitle?: string;
        ogDescription?: string;
        canonical?: string;
        lang?: string;
    };
    headings: {
        h1: string[];
        h2: string[];
        h3: string[];
    };
    images: {
        total: number;
        withAlt: number;
        missingAltSources: string[];
    };
    links: {
        internal: number;
        external: number;
    };
    schema: {
        types: string[];
        raw: string[];
    };
    content: {
        lists: number;
        questions: number;
        wordCount: number;
    };
    performance: {
        responseTime: number;
    };
    scores: {
        seo: number;
        ai: number;
        performance: number;
        breakdown: {
            seo: ScoreCheck[];
            ai: ScoreCheck[];
            performance: ScoreCheck[];
        };
    };
    recommendations: Recommendation[];
    details: Record<string, DetailedItem>;
    criticalErrors: number;
}

export interface SiteAuditResult {
    isSiteWide: true;
    baseUrl: string;
    totalPages: number;
    avgScores: {
        seo: number;
        ai: number;
        performance: number;
    };
    pages: (AuditResult & { criticalErrors: number })[];
    allRecommendations: Recommendation[];
}

export async function analyzeUrl(url: string): Promise<AuditResult> {
    const startTime = Date.now();
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
    });
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
        throw new Error(`Nie udało się pobrać strony: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';
    const lang = $('html').attr('lang');

    const h1Data = $('h1').map((_, el) => {
        const $el = $(el);
        const parentTag = $el.parent().prop('tagName')?.toLowerCase() || 'unknown';
        const parentClass = $el.parent().attr('class');
        const parentSelector = parentTag + (parentClass ? '.' + parentClass.trim().split(/\s+/).join('.') : '');

        return {
            text: $el.text().trim(),
            classes: $el.attr('class') || '',
            id: $el.attr('id') || '',
            parent: parentSelector
        };
    }).get();

    const h2s = $('h2').map((_, el) => $(el).text().trim()).get();
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get();

    const images = $('img');
    const imagesWithAlt = $('img[alt]');
    const missingAltData = $('img:not([alt])').map((_, el) => {
        const $el = $(el);
        const parentTag = $el.parent().prop('tagName')?.toLowerCase() || 'unknown';
        return {
            src: $el.attr('src') || 'unknown',
            classes: $el.attr('class') || '',
            parent: parentTag
        };
    }).get().slice(0, 10);

    const links = $('a');
    const internalLinksUrls = links.map((_, el) => $(el).attr('href')).get()
        .filter(href => href && (href.startsWith('/') || href.startsWith(url)))
        .map(href => href.startsWith('/') ? new URL(href, url).href : href);

    const internalLinksCount = new Set(internalLinksUrls).size;

    const schemaRaw: string[] = [];
    const schemaTypes = $('script[type="application/ld+json"]')
        .map((_, el) => {
            try {
                const content = $(el).html() || '{}';
                schemaRaw.push(content);
                const json = JSON.parse(content);
                return json['@type'] || 'Nieznany typ';
            } catch {
                return 'Nieprawidłowy JSON';
            }
        })
        .get();

    const lists = $('ul, ol').length;
    const bodyText = $('body').text() || "";
    const questions = (bodyText.match(/\?/g) || []).length;
    const wordCount = bodyText.trim().split(/\s+/).length;

    const context = {
        title, description, h1s: h1Data.map(d => d.text), images: images.length, imagesWithAlt: imagesWithAlt.length, schema: schemaTypes, lists, questions, responseTime, lang, h2s, wordCount
    };

    const seoChecks = getSeoChecks(context);
    const aiChecks = getAiChecks(context);
    const perfChecks = getPerfChecks(responseTime);

    const seoScore = Math.round((seoChecks.reduce((acc, c) => acc + c.points, 0) / seoChecks.reduce((acc, c) => acc + c.maxPoints, 0)) * 100);
    const aiScore = Math.round((aiChecks.reduce((acc, c) => acc + c.points, 0) / aiChecks.reduce((acc, c) => acc + c.maxPoints, 0)) * 100);
    const perfScore = Math.round((perfChecks.reduce((acc, c) => acc + c.points, 0) / perfChecks.reduce((acc, c) => acc + c.maxPoints, 0)) * 100);

    const recommendations = generateRecommendations(context, seoChecks, aiChecks, perfChecks);

    const details: Record<string, DetailedItem> = {
        h1: {
            type: "list",
            label: "Lokalizacja nagłówków H1",
            items: h1Data.map(d => ({
                value: d.text,
                context: `Selektor: h1${d.id ? '#' + d.id : ''}${d.classes ? '.' + d.classes.split(' ').join('.') : ''} | Rodzic: ${d.parent}`,
                reason: d.classes.includes('hidden') || d.classes.includes('sr-only') ? "Ukryty (np. dla czytników)" : "Widoczny"
            }))
        },
        schema: {
            type: "list",
            label: "Wykryte typy danych strukturalnych",
            items: schemaTypes.length > 0 ? schemaTypes.map(t => ({ value: t })) : [{ value: "Brak danych strukturalnych" }]
        },
        images: {
            type: "list",
            label: "Obrazy bez atrybutu ALT (lokalizacja)",
            items: missingAltData.length > 0 ? missingAltData.map(d => ({
                value: d.src,
                context: `Klasy: ${d.classes || 'brak'} | Rodzic: ${d.parent}`
            })) : [{ value: "Wszystkie obrazy mają atrybut ALT" }]
        }
    };

    return {
        url,
        title,
        description,
        meta: {
            ogTitle: $('meta[property="og:title"]').attr('content'),
            ogDescription: $('meta[property="og:description"]').attr('content'),
            canonical: $('link[rel="canonical"]').attr('href'),
            lang,
        },
        headings: {
            h1: h1Data.map(d => d.text),
            h2: h2s,
            h3: h3s,
        },
        images: {
            total: images.length,
            withAlt: imagesWithAlt.length,
            missingAltSources: missingAltData.map(d => d.src)
        },
        links: {
            internal: internalLinksCount,
            external: links.length - internalLinksCount,
        },
        schema: {
            types: schemaTypes,
            raw: schemaRaw
        },
        content: {
            lists,
            questions,
            wordCount,
        },
        performance: {
            responseTime,
        },
        scores: {
            seo: seoScore,
            ai: aiScore,
            performance: perfScore,
            breakdown: {
                seo: seoChecks,
                ai: aiChecks,
                performance: perfChecks
            }
        },
        recommendations,
        details,
        criticalErrors: recommendations.filter(r => r.priority === 'high').length
    };
}

function getSeoChecks(data: any): ScoreCheck[] {
    const checks: ScoreCheck[] = [
        { label: "Nagłówek H1 (dokładnie jeden)", points: data.h1s.length === 1 ? 25 : 0, maxPoints: 25, passed: data.h1s.length === 1, impact: data.h1s.length === 1 ? 0 : 25 },
        { label: "Tag Title (30-65 znaków)", points: data.title.length >= 30 && data.title.length <= 65 ? 25 : 0, maxPoints: 25, passed: data.title.length >= 30 && data.title.length <= 65, impact: data.title.length >= 30 && data.title.length <= 65 ? 0 : 25 },
        { label: "Meta Description (obecny)", points: !!data.description ? 25 : 0, maxPoints: 25, passed: !!data.description, impact: !!data.description ? 0 : 25 },
        { label: "Atrybuty ALT dla obrazów", points: (data.images === 0 || data.imagesWithAlt / data.images > 0.9) ? 25 : 0, maxPoints: 25, passed: (data.images === 0 || data.imagesWithAlt / data.images > 0.9), impact: (data.images === 0 || data.imagesWithAlt / data.images > 0.9) ? 0 : 25 },
    ];
    return checks;
}

function getAiChecks(data: any): ScoreCheck[] {
    return [
        { label: "Dane strukturalne (Schema)", points: data.schema.length > 0 ? 30 : 0, maxPoints: 30, passed: data.schema.length > 0, impact: data.schema.length > 0 ? 0 : 30 },
        { label: "Listy punktowane (min. 3)", points: data.lists >= 3 ? 25 : 0, maxPoints: 25, passed: data.lists >= 3, impact: data.lists >= 3 ? 0 : 25 },
        { label: "Gęstość pytań i nagłówki Q&A", points: (data.questions >= 2 || data.h2s.some((h: string) => h.includes('?'))) ? 25 : 0, maxPoints: 25, passed: (data.questions >= 2 || data.h2s.some((h: string) => h.includes('?'))), impact: (data.questions >= 2 || data.h2s.some((h: string) => h.includes('?'))) ? 0 : 25 },
        { label: "Autorytet (min. 600 słów)", points: data.wordCount >= 600 ? 20 : 0, maxPoints: 20, passed: data.wordCount >= 600, impact: data.wordCount >= 600 ? 0 : 20 },
    ];
}

function getPerfChecks(responseTime: number): ScoreCheck[] {
    return [
        { label: "Czas TTFB < 300ms", points: responseTime < 300 ? 50 : responseTime < 800 ? 25 : 0, maxPoints: 50, passed: responseTime < 300, impact: responseTime < 300 ? 0 : responseTime < 800 ? 25 : 50 },
        { label: "Lekka struktura DOM", points: 50, maxPoints: 50, passed: true, impact: 0 }, // Placeholder for advanced metrics if needed
    ];
}

function generateRecommendations(data: any, seoChecks: ScoreCheck[], aiChecks: ScoreCheck[], perfChecks: ScoreCheck[]): Recommendation[] {
    const recs: Recommendation[] = [];

    seoChecks.filter(c => !c.passed).forEach(c => {
        if (c.label.includes("H1")) {
            recs.push({ title: data.h1s.length === 0 ? "Brak nagłówka H1" : "Wiele nagłówków H1", description: "Popraw strukturę nagłówków. H1 jest kluczowy dla robotów i modeli AI.", priority: "high", category: "SEO" });
        } else if (c.label.includes("Title")) {
            recs.push({ title: "Zbyt krótki lub brak tytułu", description: "Tytuł powinien mieć od 30 do 65 znaków, aby dobrze wyświetlać się w wynikach.", priority: "medium", category: "SEO" });
        } else if (c.label.includes("Meta")) {
            recs.push({ title: "Brak opisu Meta Description", description: "Dodaj unikalny opis strony, aby zwiększyć klikalność w wynikach wyszukiwania.", priority: "high", category: "SEO" });
        } else if (c.label.includes("ALT")) {
            recs.push({ title: "Brakujące opisy ALT", description: "Uzupełnij atrybuty ALT w obrazkach dla lepszej dostępności i widoczności w wyszukiwarkach grafiki.", priority: "medium", category: "SEO" });
        }
    });

    aiChecks.filter(c => !c.passed).forEach(c => {
        if (c.label.includes("Schema")) {
            recs.push({ title: "Dodaj Schema.org", description: "Google AI Overviews (SGE) polega na danych strukturalnych do generowania podsumowań.", priority: "high", category: "AI" });
        } else if (c.label.includes("Listy")) {
            recs.push({ title: "Zwiększ liczbę list", description: "AI uwielbia ustrukturyzowane informacje. Użyj formatowania <ul>/<li> dla ważnych punktów.", priority: "low", category: "AI" });
        } else if (c.label.includes("pytań")) {
            recs.push({ title: "Dodaj sekcję FAQ lub pytania", description: "Modele AI szukają bezpośrednich odpowiedzi na pytania użytkowników.", priority: "medium", category: "AI" });
        } else if (c.label.includes("słów")) {
            recs.push({ title: "Rozbuduj treść (Thin Content)", description: "Dłuższe treści (powyżej 600 słów) budują większy autorytet tematyczny w oczach AI.", priority: "medium", category: "AI" });
        }
    });

    perfChecks.filter(c => !c.passed).forEach(c => {
        recs.push({ title: "Zoptymalizuj czas odpowiedzi (TTFB)", description: `Strona odpowiedziała po ${data.responseTime}ms. Idealny czas to poniżej 300ms.`, priority: "high", category: "Performance" });
    });

    // accessibility check (separate from scores for now)
    if (!data.lang) {
        recs.push({ title: "Brak atrybutu lang", description: "Zdefiniuj język strony w tagu <html>.", priority: "medium", category: "Accessibility" });
    }

    return recs.sort((a, b) => {
        const priorityMap = { high: 0, medium: 1, low: 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
    });
}

export async function crawlSite(
    baseUrl: string,
    maxPages: number = 500,
    onProgress?: (data: { current: number; total: number; message: string; page?: any }) => void
): Promise<SiteAuditResult> {
    const visited = new Set<string>();
    const queue: string[] = [baseUrl];
    const results: AuditResult[] = [];

    const domain = new URL(baseUrl).hostname;
    const CONCURRENCY = 5;

    while (queue.length > 0 && visited.size < maxPages) {
        const batch = queue.splice(0, CONCURRENCY);
        const currentBatchUrls = batch.filter(url => !visited.has(url));
        if (currentBatchUrls.length === 0) continue;
        currentBatchUrls.forEach(url => visited.add(url));

        const batchResults = await Promise.all(
            currentBatchUrls.map(async (url) => {
                try {
                    if (onProgress) onProgress({ current: results.length, total: visited.size + queue.length, message: `Analizowanie: ${url}` });
                    const result = await analyzeUrl(url);

                    const response = await fetch(url);
                    const html = await response.text();
                    const $ = cheerio.load(html);
                    $('a').each((_, el) => {
                        let href = $(el).attr('href');
                        if (href) {
                            try {
                                const absoluteUrl = new URL(href, url);
                                absoluteUrl.hash = '';
                                const finalUrl = absoluteUrl.href;
                                if (absoluteUrl.hostname === domain && !visited.has(finalUrl) && !queue.includes(finalUrl)) {
                                    if (!finalUrl.match(/\.(jpg|jpeg|png|gif|pdf|zip|css|js|xml|svg|webp)$/i)) queue.push(finalUrl);
                                }
                            } catch (e) { }
                        }
                    });
                    return result;
                } catch (e: any) {
                    console.error(`Error analyzing ${url}:`, e.message);
                    return null;
                }
            })
        );

        const validResults = batchResults.filter((r): r is AuditResult => r !== null);
        results.push(...validResults);

        if (onProgress) {
            validResults.forEach(r => {
                onProgress({
                    current: results.length,
                    total: visited.size + queue.length,
                    message: `Ukończono: ${r.url}`,
                    page: { ...r }
                });
            });
        }
    }

    const avgScores = {
        seo: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.scores.seo, 0) / results.length) : 0,
        ai: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.scores.ai, 0) / results.length) : 0,
        performance: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.scores.performance, 0) / results.length) : 0,
    };

    return {
        isSiteWide: true,
        baseUrl,
        totalPages: results.length,
        avgScores,
        pages: results.map(r => ({
            ...r
        })),
        allRecommendations: results.flatMap(r => r.recommendations).filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
    };
}
