import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl, crawlSite } from '@/lib/analyzer';

export const runtime = 'nodejs'; // Ensure nodejs runtime for long requests
export const maxDuration = 300; // Extend duration for large crawls (if supported by platform)

export async function POST(req: NextRequest) {
    try {
        const { url, isSiteWide } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        if (isSiteWide) {
            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        const finalResult = await crawlSite(url, 500, (progress) => {
                            controller.enqueue(encoder.encode(JSON.stringify({ type: 'progress', ...progress }) + '\n'));
                        });
                        controller.enqueue(encoder.encode(JSON.stringify({ type: 'final', result: finalResult }) + '\n'));
                        controller.close();
                    } catch (e: any) {
                        controller.enqueue(encoder.encode(JSON.stringify({ type: 'error', message: e.message }) + '\n'));
                        controller.close();
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'application/x-ndjson',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } else {
            const result = await analyzeUrl(url);
            return NextResponse.json(result);
        }
    } catch (error: any) {
        console.error('Audit API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
