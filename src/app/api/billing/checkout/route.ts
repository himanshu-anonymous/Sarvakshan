/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import { stripe } from "@/lib/stripe/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { priceId } = await req.json();

    const checkoutSession = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
        client_reference_id: session.user.id,
    });

    return NextResponse.json({ url: checkoutSession.url });
}
