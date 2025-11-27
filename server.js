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

// POST /api/quote - Returns HTML (n8n will convert to PDF)
app.post('/api/quote', async (req, res) => {
    try {
        const data = req.body;

        if (!data || !data.zones) {
            return res.status(400).json({ error: 'Invalid data structure. "zones" is required.' });
        }

        // Generate HTML
        const finalHtml = generateQuotationHTML(data, templateHtml);

        // Return HTML
        res.set('Content-Type', 'text/html');
        res.send(finalHtml);

    } catch (error) {
        console.error("Error generating HTML:", error);
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
