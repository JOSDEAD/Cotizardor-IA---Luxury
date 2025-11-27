const express = require('express');
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

// POST /api/quote - Returns PDF using Gotenberg
app.post('/api/quote', async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.zones) {
            return res.status(400).json({ error: 'Invalid data structure. "zones" is required.' });
        }

        // 1. Generate HTML
        const finalHtml = generateQuotationHTML(data, templateHtml);

        // 2. Send HTML to Gotenberg for PDF conversion
        const FormData = require('form-data');
        const form = new FormData();

        // Add HTML as index.html file (Gotenberg requires this specific name)
        form.append('files', Buffer.from(finalHtml), {
            filename: 'index.html',
            contentType: 'text/html; charset=utf-8'
        });

        // Add PDF options
        form.append('marginTop', '0');
        form.append('marginBottom', '0');
        form.append('marginLeft', '0');
        form.append('marginRight', '0');
        form.append('printBackground', 'true');

        // Gotenberg configuration
        const gotenbergUrl = process.env.GOTENBERG_URL || 'https://infrait-gotenberg.4fd8oo.easypanel.host';

        console.log('Sending request to Gotenberg:', gotenbergUrl);

        const response = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        console.log('Gotenberg response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gotenberg error response:', errorText);
            throw new Error(`Gotenberg error: ${response.status} ${response.statusText}`);
        }

        // 3. Get PDF buffer from Gotenberg
        const pdfBuffer = await response.arrayBuffer();

        // 4. Send PDF to client
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.byteLength,
            'Content-Disposition': `attachment; filename="cotizacion_${data.reference || 'draft'}.pdf"`
        });

        res.send(Buffer.from(pdfBuffer));

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
