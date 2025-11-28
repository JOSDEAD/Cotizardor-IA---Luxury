// Function to format currency (Colones)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(amount);
};

// Function to generate a SVG Pie/Donut Chart
function generateSVGChart(zones) {
    // Calculate totals per zone (considering discounts)
    const data = zones.map(z => {
        const total = z.items.reduce((sum, item) => {
            const sub = item.qty * item.price;
            const disc = sub * (item.discount || 0);
            return sum + (sub - disc);
        }, 0);
        return { name: z.name.split(':')[0], full_name: z.name, value: total };
    });

    const totalValue = data.reduce((acc, cur) => acc + cur.value, 0);
    let startAngle = 0;

    // Gold/Black Palette
    const colors = ['#D4AF37', '#000000', '#333333', '#555555', '#777777', '#C5A028'];

    let paths = '';
    let legends = '';

    // SVG Config
    const width = 600;
    const height = 400;
    const cx = 200; // Center X of pie
    const cy = 200; // Center Y
    const r = 120;  // Radius

    data.forEach((slice, i) => {
        if (slice.value === 0) return;

        const angle = (slice.value / totalValue) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        // Calculate coordinates
        const x1 = cx + r * Math.sin(startAngle);
        const y1 = cy - r * Math.cos(startAngle);
        const x2 = cx + r * Math.sin(endAngle);
        const y2 = cy - r * Math.cos(endAngle);

        // Large arc flag
        const largeArc = angle > Math.PI ? 1 : 0;

        // Path command
        // If it's a full circle (single item), draw a circle instead
        let d;
        if (Math.abs(angle - 2 * Math.PI) < 0.001) {
            d = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
        } else {
            d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        }

        const color = colors[i % colors.length];

        paths += `<path d="${d}" fill="${color}" stroke="white" stroke-width="2" />`;

        // Legend
        const percentage = ((slice.value / totalValue) * 100).toFixed(1) + '%';
        legends += `
            <g transform="translate(380, ${100 + (i * 30)})">
                <rect width="15" height="15" fill="${color}" rx="3" />
                <text x="25" y="12" font-family="Lato" font-size="14" fill="#333">${slice.name}</text>
                <text x="25" y="28" font-family="Lato" font-size="12" fill="#666" font-weight="bold">${formatCurrency(slice.value)} (${percentage})</text>
            </g>
        `;

        startAngle = endAngle;
    });

    return `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            ${paths}
            <!-- Donut Hole (Optional, makes it look modern) -->
            <circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="white" />
            ${legends}
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
            const subtotal = item.qty * item.price;
            const discountAmount = subtotal * (item.discount || 0);
            const total = subtotal - discountAmount;
            const taxAmount = total * (item.tax || 0);

            zoneSubtotal += total;
            globalSubtotal += total;
            globalTax += taxAmount;

            const discountText = item.discount ? `<span style="color: #d9534f;">-${(item.discount * 100).toFixed(0)}%</span>` : '-';

            itemsRows += `
                <tr>
                    <td class="col-desc">
                        <strong>${item.name}</strong><br>
                        <span style="color: #666; font-size: 12px;">${item.description || ''}</span>
                    </td>
                    <td class="col-unit">${item.unit}</td>
                    <td class="col-qty">${item.qty}</td>
                    <td class="col-price">${formatCurrency(item.price)}</td>
                    <td class="col-discount">${discountText}</td>
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
                            <th class="col-discount">Desc.</th>
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

    // Conditional Company Field
    const companyHtml = data.clientCompany ?
        `<p id="client-company">${data.clientCompany}</p>` :
        '';

    // Logo Injection
    const logoHtml = data.logoBase64 ?
        `<img src="${data.logoBase64}" class="brand-logo" alt="Luxury Lights Logo">` :
        '';

    // Replace placeholders in the template
    let finalHtml = templateHtml
        .replace('<!-- Logo will be injected here -->', logoHtml)
        .replace('<span id="date">--/--/----</span>', data.date)
        .replace('<span id="ref">#0000</span>', data.reference)
        .replace('<p id="client-name">Nombre del Cliente</p>', data.clientName)
        .replace('<p id="client-company">Empresa (Opcional)</p>', companyHtml)
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
