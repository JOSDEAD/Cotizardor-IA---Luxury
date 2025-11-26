const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

// Read data
const dataPath = path.join(__dirname, 'data.json');
const rawData = fs.readFileSync(dataPath);
const data = JSON.parse(rawData);

// Read template
const templatePath = path.join(__dirname, 'templates', 'quotation.ejs');
const template = fs.readFileSync(templatePath, 'utf-8');

// Render HTML
const html = ejs.render(template, data);

// Save HTML
const outputPath = path.join(__dirname, 'quotation.html');
fs.writeFileSync(outputPath, html);

console.log('Cotización generada exitosamente: quotation.html');
