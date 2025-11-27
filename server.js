const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { generateQuotationHTML } = require('./generate_quote');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Load template once on startup
const templatePath = path.join(__dirname, 'template.html');
let templateHtml = '';

try {
    templateHtml = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
    console.error("Error loading template.html:", err);
    process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// POST /api/quote
app.post('/api/quote', async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.zones) {
            return res.status(400).json({ error: 'Invalid data structure. "zones" is required.' });
        }

        // 1. Generate HTML
        const finalHtml = generateQuotationHTML(data, templateHtml);

        // 2. Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            executablePath: '/usr/bin/google-chrome-stable'
        });
        const page = await browser.newPage();

        // 3. Set Content
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

        // 4. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });

        await browser.close();

        // 5. Send Response
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `attachment; filename="cotizacion_${data.reference || 'draft'}.pdf"`
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

console.log('=================================');
console.log('Cotizador API Server');
console.log('=================================');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Port: ${PORT}`);
console.log(`Template loaded: ${templateHtml.length} characters`);
console.log('=================================');

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
    console.log(`✓ Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`✓ API endpoint: http://0.0.0.0:${PORT}/api/quote`);
});
