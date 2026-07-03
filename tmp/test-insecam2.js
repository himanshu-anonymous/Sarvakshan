/*
 * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.
 * This code is the exclusive property of Aditya and Mankshu.
 */

const insecam = require("insecam-api");

async function check() {
    try {
        const rated = await insecam.rating;
        const newCams = await insecam.new;
        console.log(`Rating length: ${rated?.length}`);
        console.log(`New length: ${newCams?.length}`);
    } catch(e) {
        console.error(e);
    }
}
check();
