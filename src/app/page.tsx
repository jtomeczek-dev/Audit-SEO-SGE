"use client";

import { useState, useRef } from "react";
import { ChevronUp, ChevronDown, Search, Globe, Layout, ListChecks, AlertCircle, Sparkles, FileText, Download, Zap, Shield, ArrowRight, Layers, BarChart3, Clock, CheckCircle2, XCircle, Info, Maximize2, ExternalLink, Loader2, LayoutGrid, ListTree, Monitor, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreCard } from "@/components/ScoreCard";
import { AuditDetailItem } from "@/components/AuditDetailItem";
import { RecommendationCard } from "@/components/RecommendationCard";
import { AuditResult, SiteAuditResult, DetailedItem } from "@/lib/analyzer";
import { ROBOTO_REGULAR_BASE64, ROBOTO_MEDIUM_BASE64 } from "@/lib/fonts";
import { GeminiChat } from "@/components/GeminiChat";

export default function Home() {
    const [url, setUrl] = useState("");
    const [isSiteWide, setIsSiteWide] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<{ current: number, total: number, message: string }>({ current: 0, total: 0, message: "" });
    const [report, setReport] = useState<AuditResult | SiteAuditResult | null>(null);
    const [siteReportCache, setSiteReportCache] = useState<SiteAuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedDetail, setSelectedDetail] = useState<DetailedItem | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: 'url' | 'seo' | 'ai' | 'performance' | 'errors', direction: 'asc' | 'desc' } | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const detailsRef = useRef<HTMLElement>(null);

    const handleSort = (key: 'url' | 'seo' | 'ai' | 'performance' | 'errors') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedPages = (pages: any[]) => {
        if (!sortConfig) return pages;
        return [...pages].sort((a, b) => {
            if (sortConfig.key === 'url') {
                return sortConfig.direction === 'asc'
                    ? a.url.localeCompare(b.url)
                    : b.url.localeCompare(a.url);
            }
            if (sortConfig.key === 'seo') {
                return sortConfig.direction === 'asc'
                    ? a.scores.seo - b.scores.seo
                    : b.scores.seo - a.scores.seo;
            }
            if (sortConfig.key === 'ai') {
                return sortConfig.direction === 'asc'
                    ? a.scores.ai - b.scores.ai
                    : b.scores.ai - a.scores.ai;
            }
            if (sortConfig.key === 'performance') {
                return sortConfig.direction === 'asc'
                    ? a.scores.performance - b.scores.performance
                    : b.scores.performance - a.scores.performance;
            }
            if (sortConfig.key === 'errors') {
                return sortConfig.direction === 'asc'
                    ? a.criticalErrors - b.criticalErrors
                    : b.criticalErrors - a.criticalErrors;
            }
            return 0;
        });
    };

    const handleAudit = async (e?: React.FormEvent, overrideUrl?: string) => {
        if (e) e.preventDefault();
        const targetUrl = overrideUrl || url;
        if (!targetUrl) return;

        setIsLoading(true);
        setError(null);
        setReport(null);
        setSelectedDetail(null);
        setProgress({ current: 0, total: 0, message: "Inicjowanie..." });

        try {
            const response = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl, isSiteWide: overrideUrl ? false : isSiteWide }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Nie udało się przeanalizować strony");
            }

            if (isSiteWide && !overrideUrl) {
                const reader = response.body?.getReader();
                const textDecoder = new TextDecoder();

                if (!reader) throw new Error("Stream reader not available");

                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += textDecoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        const data = JSON.parse(line);

                        if (data.type === 'progress') {
                            setProgress({ current: data.current, total: data.total, message: data.message });
                        } else if (data.type === 'final') {
                            setReport(data.result);
                            setSiteReportCache(data.result);
                        } else if (data.type === 'error') {
                            throw new Error(data.message);
                        }
                    }
                }
            } else {
                const data = await response.json();
                setReport(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPage = (targetUrl: string) => {
        if (siteReportCache) {
            const cachedPage = siteReportCache.pages.find(p => p.url === targetUrl);
            if (cachedPage) {
                setReport(cachedPage);
                setIsSiteWide(false);
                setUrl(targetUrl);
                return;
            }
        }
        setUrl(targetUrl);
        setIsSiteWide(false);
        handleAudit(undefined, targetUrl);
    };

    const handleBackToSite = () => {
        if (siteReportCache) {
            setReport(siteReportCache);
            setIsSiteWide(true);
        }
    };

    const handleDrillDown = (key: string) => {
        if (report && !('isSiteWide' in report) && report.details[key]) {
            setSelectedDetail(report.details[key]);
            setTimeout(() => {
                detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    const handleExport = async () => {
        if (!report) return;
        setIsLoading(true);

        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPos = 40;

            // --- FONT CONFIGURATION (Polish Support) ---
            pdf.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
            pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
            pdf.addFileToVFS("Roboto-Medium.ttf", ROBOTO_MEDIUM_BASE64);
            pdf.addFont("Roboto-Medium.ttf", "Roboto", "bold");
            pdf.setFont("Roboto", "normal");

            // Helper for adding a new page and resetting yPos
            const addNewPage = () => {
                pdf.addPage();
                yPos = 30;
                addHeader();
            };

            const addHeader = () => {
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text("Opracowanie Biznesowe - Audyt SEO & AI", margin, 15);
                pdf.text(`Domena: ${new URL(url).hostname}`, pageWidth - margin, 15, { align: "right" });
                pdf.setDrawColor(240, 240, 240);
                pdf.line(margin, 18, pageWidth - margin, 18);
            };

            const addFooter = (pageNum: number) => {
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Strona ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
            };

            // --- STRONA TYTUŁOWA ---
            pdf.setFillColor(2, 6, 23); // Dark theme matching UI
            pdf.rect(0, 0, pageWidth, pageHeight, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(48);
            pdf.setFont("Roboto", "bold");
            pdf.text("AUDYT SEO", margin, 100);
            pdf.text("& AI OVERVIEW", margin, 120);

            pdf.setDrawColor(34, 211, 238); // Cyan
            pdf.setLineWidth(1.5);
            pdf.line(margin, 130, margin + 40, 130);

            pdf.setFontSize(14);
            pdf.setFont("Roboto", "normal");
            pdf.text("Analiza biznesowa i techniczna serwisu", margin, 145);

            pdf.setFont("Roboto", "bold");
            pdf.setFontSize(24);
            pdf.text(new URL(url).hostname, margin, 170);

            pdf.setFontSize(10);
            pdf.setFont("Roboto", "normal");
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Data opracowania: ${new Date().toLocaleDateString('pl-PL')}`, margin, pageHeight - 30);
            pdf.text("Wygenerowano przez: Audyt SEO i SGE", margin, pageHeight - 25);

            // --- STRONA 2: PODSUMOWANIE MENEDŻERSKIE ---
            addNewPage();
            pdf.setTextColor(30, 41, 59);
            pdf.setFontSize(22);
            pdf.setFont("Roboto", "bold");
            pdf.text("1. Podsumowanie Menedżerskie", margin, yPos);
            yPos += 15;

            pdf.setFont("Roboto", "normal");
            pdf.setFontSize(11);
            pdf.setTextColor(71, 85, 105);
            const summaryText = isSiteWide
                ? "Niniejsze opracowanie stanowi kompleksową analizę widoczności serwisu pod kątem tradycyjnych wyszukiwarek (SEO) oraz systemów nowej generacji opartych na AI (Google SGE). Audyt obejmuje ocenę fundamentów technicznych, wydajności oraz semantycznego przygotowania treści."
                : `Szczegółowa analiza podstrony ${url} pod kątem optymalizacji technicznej oraz czytelności dla modeli językowych AI.`;

            const lines = pdf.splitTextToSize(summaryText, contentWidth);
            pdf.text(lines, margin, yPos);
            yPos += lines.length * 7 + 10;

            // KPI Box
            pdf.setFillColor(248, 250, 252);
            pdf.roundedRect(margin, yPos, contentWidth, 45, 3, 3, "F");

            const scores = 'isSiteWide' in report ? report.avgScores : report.scores;

            const drawMetric = (label: string, value: number, x: number) => {
                pdf.setFontSize(10);
                pdf.setFont("Roboto", "normal");
                pdf.setTextColor(100, 116, 139);
                pdf.text(label, x, yPos + 15, { align: "center" });
                pdf.setFontSize(24);
                pdf.setFont("Roboto", "bold");
                if (value > 80) pdf.setTextColor(16, 185, 129); // Green
                else if (value > 50) pdf.setTextColor(245, 158, 11); // Amber
                else pdf.setTextColor(244, 63, 94); // Rose
                pdf.text(`${value}%`, x, yPos + 30, { align: "center" });
            };

            drawMetric("SEO FUNDAMENTY", scores.seo, margin + (contentWidth / 6));
            drawMetric("WYDAJNOŚĆ", scores.performance, margin + (contentWidth / 2));
            drawMetric("SGE / AI READINESS", scores.ai, margin + (contentWidth * 5 / 6));

            yPos += 60;

            // --- REKOMENDACJE ---
            pdf.setFontSize(18);
            pdf.setTextColor(30, 41, 59);
            pdf.setFont("Roboto", "bold");
            pdf.text("2. Kluczowe Rekomendacje", margin, yPos);
            yPos += 12;

            const recommendations = 'isSiteWide' in report ? report.allRecommendations.slice(0, 10) : report.recommendations;

            autoTable(pdf, {
                startY: yPos,
                margin: { left: margin, right: margin },
                styles: { font: "Roboto", fontStyle: "normal" },
                head: [['Priorytet', 'Zalecenie', 'Opis']],
                body: recommendations.map(r => [
                    r.priority === 'high' ? 'WYSOKI' : r.priority === 'medium' ? 'ŚREDNI' : 'NISKI',
                    r.title,
                    r.description
                ]),
                headStyles: { fillColor: [15, 23, 42] },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 25 },
                    1: { fontStyle: 'bold', cellWidth: 50 },
                    2: { cellWidth: 95 },
                },
                didDrawPage: (data) => {
                    yPos = data.cursor?.y || yPos;
                }
            });

            yPos = (pdf as any).lastAutoTable.finalY + 20;

            // --- STRONA 3+: SZCZEGÓŁY / LISTA PODSTRON ---
            if ('isSiteWide' in report) {
                addNewPage();
                pdf.setFontSize(18);
                pdf.setFont("Roboto", "bold");
                pdf.text("3. Wykaz Przeanalizowanych Podstron", margin, yPos);
                yPos += 10;

                autoTable(pdf, {
                    startY: yPos,
                    margin: { left: margin, right: margin },
                    styles: { font: "Roboto", fontStyle: "normal" },
                    head: [['Adres URL', 'SEO', 'Wyd.', 'SGE', 'Błędy']],
                    body: report.pages.map(p => [
                        p.url.substring(0, 80) + (p.url.length > 80 ? '...' : ''),
                        `${p.scores.seo}%`,
                        `${p.scores.performance}%`,
                        `${p.scores.ai}%`,
                        p.criticalErrors
                    ]),
                    headStyles: { fillColor: [79, 70, 229] }, // Indigo
                    columnStyles: {
                        0: { cellWidth: 100 },
                        1: { halign: 'center' },
                        2: { halign: 'center' },
                        3: { halign: 'center' },
                        4: { halign: 'center' },
                    }
                });
            } else {
                // Single page details
                addNewPage();
                pdf.setFontSize(18);
                pdf.setFont("Roboto", "bold");
                pdf.text("3. Analiza Techniczna Strony", margin, yPos);
                yPos += 15;

                const addDetailSection = (title: string, data: any) => {
                    if (yPos > 240) addNewPage();
                    pdf.setFontSize(12);
                    pdf.setFont("Roboto", "bold");
                    pdf.setTextColor(15, 23, 42);
                    pdf.text(title, margin, yPos);
                    yPos += 6;
                    pdf.setFont("Roboto", "normal");
                    pdf.setFontSize(10);
                    pdf.setTextColor(71, 85, 105);
                    const detailLines = pdf.splitTextToSize(data, contentWidth);
                    pdf.text(detailLines, margin, yPos);
                    yPos += detailLines.length * 5 + 10;
                };

                addDetailSection("Tytuł strony (TitleTag):", report.title);
                addDetailSection("Opis meta (Description):", report.description || "Brak opisu meta.");
                addDetailSection("Nagłówki H1:", report.headings.h1.join(", ") || "Nie znaleziono nagłówka H1.");
                addDetailSection("Dane strukturalne (Schema):", report.schema.types.join(", ") || "Brak danych strukturalnych.");
                addDetailSection("Statystyki treści:", `Liczba słów: ${report.content.wordCount} | Liczba list: ${report.content.lists} | Liczba pytań: ${report.content.questions}`);
            }

            // Final page numbering
            const totalPages = (pdf as any).internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                addFooter(i);
            }

            pdf.save(`opracowanie-biznesowe-${new URL(url).hostname}.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
            alert("Nie udało się wyeksportować opracowania biznesowego. Spróbuj ponownie.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30">
                {/* Background blobs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    <nav className="flex justify-end mb-8">
                        <Link
                            href="/pobierz"
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-sm font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-lg"
                        >
                            <Monitor className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                            <span>Pobierz na macOS</span>
                        </Link>
                    </nav>

                    <header className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-medium text-cyan-400 mb-4">
                                <Sparkles className="w-3 h-3" />
                                Audyt SEO i SGE v1.0.0
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gradient">
                                Analiza pod kątem SEO i SGE
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
                                Pobierz zaawansowany raport SEO, Performance i AI Overview (SGE).
                                Przygotuj swoje treści na nową erę wyszukiwania konwersacyjnego.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-12 max-w-3xl mx-auto"
                        >
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <button
                                    onClick={() => setIsSiteWide(false)}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${!isSiteWide ? 'bg-cyan-600 border-cyan-500 text-white font-bold' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                                >
                                    <FileText className="w-4 h-4" /> Pojedyncza Strona
                                </button>
                                <button
                                    onClick={() => setIsSiteWide(true)}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${isSiteWide ? 'bg-purple-600 border-purple-500 text-white font-bold' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Layers className="w-4 h-4" /> Cały Serwis (Głęboki Skan)
                                </button>
                            </div>

                            <form
                                onSubmit={handleAudit}
                                className="relative group"
                            >
                                <div className={`absolute -inset-1 bg-gradient-to-r ${isSiteWide ? 'from-purple-600 to-indigo-600' : 'from-purple-600 to-cyan-600'} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
                                <div className="relative flex flex-col sm:flex-row items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2 gap-2">
                                    <div className="flex-1 flex items-center px-4 w-full">
                                        <Globe className="w-5 h-5 text-slate-500" />
                                        <input
                                            type="url"
                                            placeholder={isSiteWide ? "Podaj domenę główną (np. https://triva.pl)" : "Wklej adres URL (https://...)"}
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 py-4 px-3"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full sm:w-auto ${isSiteWide ? 'bg-purple-600 hover:bg-purple-500' : 'bg-cyan-600 hover:bg-cyan-500'} text-white font-bold px-10 py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                {isSiteWide ? "Skanowanie..." : "Analizowanie..."}
                                            </span>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 fill-current" /> {isSiteWide ? "Głęboki Skan" : "Uruchom Audyt"}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {isLoading && isSiteWide && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 p-4 glass-morphism rounded-2xl border-purple-500/20"
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Postęp Głębokiego Skanu</span>
                                            <span className="text-xs font-bold text-slate-300">{progress.current} / {progress.total} stron</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic truncate text-center">{progress.message}</p>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-rose-500 text-sm flex items-center justify-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> {error}
                                    </motion.p>
                                )}
                            </form>
                        </motion.div>
                    </header>

                    <AnimatePresence>
                        {report && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 40 }}
                                className="space-y-12"
                                id="report-content"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-8">
                                    <div>
                                        <div className="flex items-center gap-4">
                                            {siteReportCache && !('isSiteWide' in report) && (
                                                <button
                                                    onClick={handleBackToSite}
                                                    className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition text-slate-400 hover:text-white"
                                                    title="Wróć do raportu serwisu"
                                                >
                                                    <ArrowRight className="w-5 h-5 rotate-180" />
                                                </button>
                                            )}
                                            <h2 className="text-4xl font-black text-white">
                                                {('isSiteWide' in report) ? "Raport Zbiorczy Serwisu" : "Wyniki Audytu Strony"}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 mt-2">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <span className="text-sm font-medium">{('isSiteWide' in report) ? url : report.url}</span>
                                            </div>
                                            {('isSiteWide' in report) && (
                                                <div className="flex items-center gap-2 px-3 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                                                    <span className="text-[10px] font-bold uppercase text-purple-400">Przeskanowano: {report.totalPages} stron</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleExport}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition font-bold"
                                    >
                                        <Download className="w-5 h-5" /> Eksportuj PDF
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <ScoreCard
                                        score={('isSiteWide' in report) ? report.avgScores.seo : report.scores.seo}
                                        label="Fundamenty SEO"
                                        icon={<BarChart3 />}
                                        color="text-cyan-400"
                                        description="Kluczowe elementy techniczne: Tytuły, opisy meta, struktura nagłówków H1 oraz optymalizacja obrazów (ALT)."
                                        breakdown={!('isSiteWide' in report) ? report.scores.breakdown.seo : undefined}
                                    />
                                    <ScoreCard
                                        score={('isSiteWide' in report) ? report.avgScores.performance : report.scores.performance}
                                        label="Wydajność"
                                        icon={<Zap />}
                                        color="text-amber-400"
                                        description="Szybkość ładowania strony i czas odpowiedzi serwera (TTFB). Kluczowe dla doświadczenia użytkownika i rankingów."
                                        breakdown={!('isSiteWide' in report) ? report.scores.breakdown.performance : undefined}
                                    />
                                    <ScoreCard
                                        score={('isSiteWide' in report) ? report.avgScores.ai : report.scores.ai}
                                        label="Gotowość na AI / SGE"
                                        icon={<Sparkles />}
                                        color="text-purple-400"
                                        description="Zrozumiałość treści dla modeli AI: dane strukturalne, gęstość pytań i odpowiedzi oraz listy ułatwiające skanowanie."
                                        breakdown={!('isSiteWide' in report) ? report.scores.breakdown.ai : undefined}
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8 space-y-8">
                                        {('isSiteWide' in report) ? (
                                            <section className="glass-morphism p-8 rounded-3xl">
                                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                                    <LayoutGrid className="text-cyan-400 w-6 h-6" /> Lista Przeskanowanych Podstron
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-800">
                                                                <th
                                                                    className="py-4 text-xs font-bold uppercase text-slate-500 px-2 cursor-pointer hover:text-cyan-400 transition"
                                                                    onClick={() => handleSort('url')}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        Adres URL
                                                                        {sortConfig?.key === 'url' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                                    </div>
                                                                </th>
                                                                <th
                                                                    className="py-4 text-xs font-bold uppercase text-slate-500 px-2 cursor-pointer hover:text-cyan-400 transition"
                                                                    onClick={() => handleSort('seo')}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        SEO
                                                                        {sortConfig?.key === 'seo' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                                    </div>
                                                                </th>
                                                                <th
                                                                    className="py-4 text-xs font-bold uppercase text-slate-500 px-2 cursor-pointer hover:text-amber-400 transition"
                                                                    onClick={() => handleSort('performance')}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        Wydajność
                                                                        {sortConfig?.key === 'performance' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                                    </div>
                                                                </th>
                                                                <th
                                                                    className="py-4 text-xs font-bold uppercase text-slate-500 px-2 cursor-pointer hover:text-purple-400 transition"
                                                                    onClick={() => handleSort('ai')}
                                                                >
                                                                    <div className="flex items-center gap-1">
                                                                        SGE
                                                                        {sortConfig?.key === 'ai' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                                    </div>
                                                                </th>
                                                                <th
                                                                    className="py-4 text-xs font-bold uppercase text-slate-500 px-2 text-center cursor-pointer hover:text-rose-400 transition"
                                                                    onClick={() => handleSort('errors')}
                                                                >
                                                                    <div className="flex items-center justify-center gap-1">
                                                                        Błędy
                                                                        {sortConfig?.key === 'errors' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                                                    </div>
                                                                </th>
                                                                <th className="py-4 text-xs font-bold uppercase text-slate-500 px-2"></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {getSortedPages(report.pages).map((p, i) => (
                                                                <tr
                                                                    key={i}
                                                                    onClick={() => handleSelectPage(p.url)}
                                                                    className="border-b border-slate-900 hover:bg-slate-800/30 transition group cursor-pointer"
                                                                >
                                                                    <td className="py-4 px-2">
                                                                        <div className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition break-all line-clamp-2">{p.url}</div>
                                                                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-1">{p.title}</div>
                                                                    </td>
                                                                    <td className="py-4 px-2">
                                                                        <div className={`text-sm font-bold ${p.scores.seo > 80 ? 'text-emerald-400' : p.scores.seo > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                            {p.scores.seo}%
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-2">
                                                                        <div className={`text-sm font-bold ${p.scores.performance > 80 ? 'text-emerald-400' : p.scores.performance > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                            {p.scores.performance}%
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-2">
                                                                        <div className={`text-sm font-bold ${p.scores.ai > 80 ? 'text-emerald-400' : p.scores.ai > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                                            {p.scores.ai}%
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-4 px-2 text-center">
                                                                        {p.criticalErrors > 0 ? (
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                                                                                <AlertCircle className="w-2.5 h-2.5" /> {p.criticalErrors}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-emerald-500 text-[10px] uppercase font-bold">OK</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-2 text-right">
                                                                        <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-400 transition" />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </section>
                                        ) : (
                                            <section className="glass-morphism p-8 rounded-3xl">
                                                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                                        <ListChecks className="text-cyan-400 w-6 h-6" /> Rekomendacje Priorytetowe
                                                    </h3>
                                                    {('criticalErrors' in report) && report.criticalErrors > 0 && (
                                                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold ring-1 ring-rose-500/20">
                                                            <AlertCircle className="w-4 h-4" /> {report.criticalErrors} krytyczne błędy
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    {report.recommendations.map((rec, i) => (
                                                        <RecommendationCard key={i} recommendation={rec} index={i} />
                                                    ))}
                                                    {report.recommendations.length === 0 && (
                                                        <div className="text-center py-8 text-slate-500 italic">Nie znaleziono krytycznych błędów. Dobra robota!</div>
                                                    )}
                                                </div>
                                            </section>
                                        )}

                                        {!('isSiteWide' in report) && (
                                            <section className="glass-morphism p-8 rounded-3xl">
                                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                                    <Layout className="text-purple-400 w-6 h-6" /> Analiza Techniczna
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                                                    <AuditDetailItem
                                                        label="Nagłówki H1"
                                                        value={report.headings.h1.length === 1 ? "1 Znaleziony" : `${report.headings.h1.length} Znaleziono`}
                                                        status={report.headings.h1.length === 1 ? "success" : "error"}
                                                        description={report.headings.h1.length === 1 ? "Optymalnie" : "Kliknij, aby zobaczyć listę"}
                                                        onClick={() => handleDrillDown('h1')}
                                                    />
                                                    <AuditDetailItem
                                                        label="Dane Strukturalne"
                                                        value={report.schema.types.length > 0 ? `${report.schema.types.length} Typów` : "Brak"}
                                                        status={report.schema.types.length > 0 ? "success" : "error"}
                                                        description="Kliknij, aby zobaczyć szczegóły"
                                                        onClick={() => handleDrillDown('schema')}
                                                    />
                                                    <AuditDetailItem
                                                        label="Szybkość Strony"
                                                        value={`${report.performance.responseTime}ms`}
                                                        status={report.performance.responseTime < 800 ? "success" : report.performance.responseTime < 2000 ? "warning" : "error"}
                                                        description="Czas odpowiedzi serwera"
                                                    />
                                                    <AuditDetailItem
                                                        label="Opisy ALT"
                                                        value={`${report.images.withAlt}/${report.images.total}`}
                                                        status={report.images.total > 0 && report.images.withAlt / report.images.total > 0.9 ? "success" : "warning"}
                                                        description={report.images.total > report.images.withAlt ? "Kliknij, aby zobaczyć braki" : "Dostępność i analiza AI"}
                                                        onClick={report.images.total > report.images.withAlt ? () => handleDrillDown('images') : undefined}
                                                    />
                                                    <AuditDetailItem
                                                        label="Wywalacze SGE"
                                                        value={report.content.questions > 1 ? "Wysoki Potencjał" : "Niski Potencjał"}
                                                        status={report.content.questions > 1 ? "success" : "warning"}
                                                        description="Gęstość pytań w treści"
                                                    />
                                                    <AuditDetailItem
                                                        label="Objętość Treści"
                                                        value={`${report.content.wordCount} słów`}
                                                        status={report.content.wordCount > 600 ? "success" : "info"}
                                                        description="Sygnał autorytetu tematycznego"
                                                    />
                                                </div>
                                            </section>
                                        )}

                                        <AnimatePresence>
                                            {selectedDetail && (
                                                <motion.section
                                                    ref={detailsRef}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="glass-morphism p-8 rounded-3xl border-rose-500/20 scroll-mt-8"
                                                >
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h3 className="text-2xl font-bold flex items-center gap-3">
                                                            <ListTree className="text-rose-400 w-6 h-6" /> {selectedDetail.label}
                                                        </h3>
                                                        <button
                                                            onClick={() => setSelectedDetail(null)}
                                                            className="text-xs font-bold text-slate-500 hover:text-slate-300 transition uppercase tracking-widest"
                                                        >
                                                            Zamknij szczegóły
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {selectedDetail.items.map((item, i) => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.03 }}
                                                                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2 group"
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${item.reason === 'Widoczny' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                                    <code className="text-sm font-bold text-slate-100 break-all">{item.value}</code>
                                                                </div>
                                                                {item.context && (
                                                                    <div className="pl-4.5 flex flex-wrap gap-2">
                                                                        <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                                                                            {item.context}
                                                                        </span>
                                                                        {item.reason && (
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded border ${item.reason === 'Widoczny' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                                                {item.reason}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </motion.section>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="lg:col-span-4 space-y-8">
                                        {('isSiteWide' in report) ? (
                                            <section className="glass-morphism p-8 rounded-3xl">
                                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                                    <ListChecks className="text-purple-400 w-5 h-5" /> Główne Rekomendacje
                                                </h3>
                                                <div className="space-y-4">
                                                    {report.allRecommendations.slice(0, 10).map((rec, i) => (
                                                        <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                                            <div className="text-xs font-bold text-rose-400 uppercase mb-1">{rec.priority}</div>
                                                            <div className="text-sm font-bold text-slate-100 mb-1">{rec.title}</div>
                                                            <div className="text-xs text-slate-400">{rec.description}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        ) : (
                                            <section className="glass-morphism p-8 rounded-3xl">
                                                <div className="flex items-center gap-2 mb-6">
                                                    <FileText className="text-slate-400 w-5 h-5" />
                                                    <h3 className="text-xl font-bold">Migawka Meta Tagów</h3>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Tag Title</span>
                                                        <p className="text-sm font-medium leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">{report.title}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Meta Description</span>
                                                        <p className="text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">{report.description || "Uwaga: Nie znaleziono opisu meta dla tej strony."}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                                        <div>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Język</span>
                                                            <p className="text-sm font-bold text-cyan-400 capitalize">{report.meta.lang || "Nieznany"}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Linki Wewn.</span>
                                                            <p className="text-sm font-bold text-slate-200">{report.links.internal}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        <div className={`bg-gradient-to-br ${isSiteWide ? 'from-purple-600/20 to-indigo-600/20' : 'from-cyan-600/20 to-purple-600/20'} border border-slate-700/50 p-8 rounded-3xl`}>
                                            <h4 className="font-bold flex items-center gap-2 text-white mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" /> Wnioski AI
                                            </h4>
                                            <div className="text-xs text-slate-400 leading-relaxed">
                                                {('isSiteWide' in report) ? (
                                                    `Ten serwis ma średnią gotowość na SGE na poziomie ${report.avgScores.ai}%. Przeanalizowano ${report.totalPages} podstron pod kątem sygnałów autorytetu i czytelności dla AI.`
                                                ) : (
                                                    `Ta strona ma ${report.schema.types.length > 0 ? "dobrą" : "słabą"} widoczność techniczną dla SGE. ${report.content.wordCount > 600 ? " Głębokość treści wskazuje na silny autorytet tematyczny." : " Rozważ rozbudowanie treści, aby wzmocnić sygnały autorytetu."}`
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <footer className="mt-20 py-8 border-t border-slate-800/50 text-center">
                        <p className="text-slate-500 text-sm">
                            Juliusz Tomeczek &copy; w ramach projektu{" "}
                            <a
                                href="https://aiforeveryone.blog"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors border-b border-cyan-500/20 hover:border-cyan-400"
                            >
                                AIforEveryone.blog
                            </a>
                        </p>
                    </footer>
                </div>
            </main>

            {/* Gemini Chat Integration */}
            {report && !('isSiteWide' in report) && (
                <>
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40 group"
                        title="Rozmawiaj z Gemini o wynikach"
                    >
                        <Sparkles className="w-6 h-6" />
                        <span className="absolute right-full mr-3 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
                            Zapytaj Gemini o tę stronę
                        </span>
                    </button>

                    <GeminiChat
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        context={report}
                    />
                </>
            )}
        </>
    );
}
