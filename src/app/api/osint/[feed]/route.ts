import { NextResponse } from "next/server";
import { API_URLS } from "@/lib/godseye/constants/dataSources";

/**
 * Universal OSINT Proxy API
 * Proxies requests to external OSINT feeds (Godseye) to bypass CORS
 * and securely manage API keys on the server.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ feed: string }> }
) {
    const p = await params;
    const feedKey = p.feed.toUpperCase();
    
    // Look up the URL from the imported Godseye constants
    let targetUrl = API_URLS[feedKey as keyof typeof API_URLS];

    if (!targetUrl) {
        return NextResponse.json({ error: "Unknown feed" }, { status: 404 });
    }

    // Handle proxies that require url appendage
    const { searchParams } = new URL(request.url);
    if (targetUrl.endsWith("=")) {
        const queryUrl = searchParams.get("url");
        if (queryUrl) {
            targetUrl += encodeURIComponent(queryUrl);
        } else {
            return NextResponse.json({ error: "Missing url parameter for proxy" }, { status: 400 });
        }
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Sarvakshan/1.0",
                "Accept": "application/json, text/plain, */*",
            },
            next: { revalidate: 60 } // Cache aggressively to prevent rate limits
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream error: ${response.status}` },
                { status: response.status }
            );
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return NextResponse.json(data);
        } else {
            const text = await response.text();
            return new NextResponse(text, {
                headers: { "Content-Type": contentType || "text/plain" }
            });
        }
    } catch (error: any) {
        console.error(`[OSINT Proxy] Error fetching ${feedKey}:`, error);
        return NextResponse.json({ error: "Internal Server Error", message: error.message, stack: error.stack }, { status: 500 });
    }
}

export async function HEAD(
    request: Request,
    { params }: { params: Promise<{ feed: string }> }
) {
    const p = await params;
    const feedKey = p.feed.toUpperCase();
    
    // Look up the URL from the imported Godseye constants
    let targetUrl = API_URLS[feedKey as keyof typeof API_URLS];

    if (!targetUrl) {
        return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { status: 200 });
}
