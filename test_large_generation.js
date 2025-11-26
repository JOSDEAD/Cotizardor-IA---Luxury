const fs = require('fs');
const { generateQuotationHTML } = require('./generate_quote');

const template = fs.readFileSync('./template.html', 'utf8');

// Helper to generate many zones
const generateZones = (count) => {
    const zones = [];
    for (let i = 1; i <= count; i++) {
        zones.push({
            name: `Zona ${i}: Área de Prueba ${i}`,
            items: [
                { name: "Perfil Gypsum", description: "Perfil de aluminio para empotrar", unit: "m", qty: Math.floor(Math.random() * 50) + 10, price: 10000, tax: 0.13 },
                { name: "Fuente de Poder", description: "MeanWell 24V 300W", unit: "unid", qty: Math.floor(Math.random() * 5) + 1, price: 100000, tax: 0.13 },
                { name: "Tira LED COB", description: "3000K 10W/m", unit: "m", qty: Math.floor(Math.random() * 50) + 10, price: 5000, tax: 0.13 },
                { name: "Controlador", description: "Dimmer WiFi", unit: "unid", qty: 1, price: 25000, tax: 0.13 }
            ]
        });
    }
    return zones;
};

const mockData = {
    clientName: "Cliente Corporativo Grande S.A.",
    reference: "COT-LARGE-001",
    date: "26/11/2025",
    zones: generateZones(30) // 30 Zones!
};

const finalHtml = generateQuotationHTML(mockData, template);

fs.writeFileSync('./output_large_test.html', finalHtml);
console.log("Large test generated: output_large_test.html");
