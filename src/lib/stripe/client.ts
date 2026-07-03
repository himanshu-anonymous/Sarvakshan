/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key", {
    apiVersion: "2026-04-22.dahlia",
});
