// Mock Data Structure (Example of what n8n should pass to this function)
/*
const inputData = {
    clientName: "Juan Pérez",
    reference: "COT-2023-001",
    date: "26/11/2025",
    zones: [
        {
            name: "Zona 1: Sala Principal",
            items: [
                { name: "Perfil Gypsum", description: "Perfil de aluminio para empotrar", unit: "m", qty: 30, price: 10000, tax: 0.13 },
                { name: "Fuente de Poder", description: "MeanWell 24V 300W", unit: "unid", qty: 2, price: 100000, tax: 0.13 }
            ]
        },
        {
            name: "Zona 2: Cocina",
            items: [
                { name: "Tira LED COB", description: "3000K 10W/m", unit: "m", qty: 15, price: 5000, tax: 0.13 }
            ]
        }
    ]
};
*/

// Function to format currency (Colones)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(amount);
};

// Function to generate a simple SVG Bar Chart
function generateSVGChart(zones) {
    // Calculate totals per zone
    const data = zones.map(z => {
        const total = z.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        return { name: z.name.split(':')[0], full_name: z.name, value: total };
    });

    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = data.length * 60 + 50; // Dynamic height based on number of zones
    const chartWidth = 600;
    const barHeight = 40;
    const labelWidth = 150;
    const maxBarWidth = chartWidth - labelWidth - 100; // Reserve space for labels and values

    let svgContent = '';

    data.forEach((d, index) => {
        const barWidth = (d.value / maxValue) * maxBarWidth;
        const y = index * 60 + 20;

        // Bar Background
        svgContent += `<rect x="${labelWidth}" y="${y}" width="${maxBarWidth}" height="${barHeight}" fill="#f0f0f0" rx="4" />`;

        // Actual Bar (Gold)
        svgContent += `<rect x="${labelWidth}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#D4AF37" rx="4">
            <animate attributeName="width" from="0" to="${barWidth}" dur="1s" fill="freeze" />
        </rect>`;

        // Label (Zone Name)
        svgContent += `<text x="${labelWidth - 10}" y="${y + 25}" font-family="Lato, sans-serif" font-size="14" text-anchor="end" fill="#333">${d.name}</text>`;

        // Value Label
        svgContent += `<text x="${labelWidth + barWidth + 10}" y="${y + 25}" font-family="Lato, sans-serif" font-size="14" fill="#333" font-weight="bold">${formatCurrency(d.value)}</text>`;
    });

    return `
        <svg width="100%" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg">
            ${svgContent}
        </svg>
    `;
}

// Main generation function
function generateQuotationHTML(data, templateHtml) {
    let zonesHtml = '';
    let globalSubtotal = 0;
    let globalTax = 0;

    data.zones.forEach(zone => {
        let zoneSubtotal = 0;
        let itemsRows = '';

        zone.items.forEach(item => {
            const total = item.qty * item.price;
            const taxAmount = total * (item.tax || 0);

            zoneSubtotal += total;
            globalSubtotal += total;
            globalTax += taxAmount;

            itemsRows += `
                <tr>
                    <td class="col-desc">
                        <strong>${item.name}</strong><br>
                        <span style="color: #666; font-size: 12px;">${item.description || ''}</span>
                    </td>
                    <td class="col-unit">${item.unit}</td>
                    <td class="col-qty">${item.qty}</td>
                    <td class="col-price">${formatCurrency(item.price)}</td>
                    <td class="col-total">${formatCurrency(total)}</td>
                </tr>
            `;
        });

        zonesHtml += `
            <div class="zone">
                <div class="zone-header">
                    <span>${zone.name}</span>
                    <span class="zone-total">Subtotal Zona: ${formatCurrency(zoneSubtotal)}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th class="col-desc">Descripción</th>
                            <th class="col-unit">Unidad</th>
                            <th class="col-qty">Cant.</th>
                            <th class="col-price">Precio Unit.</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>
            </div>
        `;
    });

    const globalTotal = globalSubtotal + globalTax;
    const chartSvg = generateSVGChart(data.zones);

    // Replace placeholders in the template
    let finalHtml = templateHtml
        .replace('<span id="date">--/--/----</span>', data.date)
        .replace('<span id="ref">#0000</span>', data.reference)
        .replace('<p id="client-name">Nombre del Cliente</p>', data.clientName)
        .replace('<!-- Zones will be injected here -->', zonesHtml)
        .replace('<span id="subtotal">₡0</span>', formatCurrency(globalSubtotal))
        .replace('<span id="tax">₡0</span>', formatCurrency(globalTax))
        .replace('<span id="total">₡0</span>', formatCurrency(globalTotal))
        .replace('<!-- SVG Chart will be injected here -->', chartSvg);

    return finalHtml;
}

// Node.js export for testing, or direct usage in n8n
if (typeof module !== 'undefined') {
    module.exports = { generateQuotationHTML };
}
