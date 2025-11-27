# Especificación del Flujo n8n - Cotizador IA

Este documento detalla cómo integrar la generación de cotizaciones usando tu propia **API Service**.

## 1. Estructura de Datos (Input JSON)

Para generar la cotización, necesitas pasar un objeto JSON con la siguiente estructura.

```json
{
  "clientName": "Nombre del Cliente",
  "reference": "COT-2025-001",
  "date": "26/11/2025",
  "zones": [
    {
      "name": "Zona 1: Sala Principal",
      "items": [
        {
          "name": "Perfil Gypsum",
          "description": "Perfil de aluminio...",
          "unit": "m",
          "qty": 30,
          "price": 10000,
          "tax": 0.13
        }
      ]
    }
  ]
}
```

## 2. Despliegue del Servicio

Antes de configurar n8n, debes desplegar el servicio.
He incluido un `Dockerfile` para que puedas subirlo fácilmente a:
*   **Render / Railway / DigitalOcean App Platform**: Solo conecta tu repositorio y apunta al Dockerfile.
*   **Tu propio VPS**: `docker build -t quote-api .` y `docker run -p 3000:3000 quote-api`.

## 3. Configuración en n8n

Ahora tu flujo en n8n necesita **dos nodos**: uno para obtener el HTML y otro para convertirlo a PDF.

### Nodo 1: "HTTP Request" (Obtener HTML)
*   **Method**: POST
*   **URL**: `https://tu-dominio-api.com/api/quote`
*   **Body Content Type**: JSON
*   **Body**: El JSON completo con clientName, reference, date, zones
*   **Response Format**: String (Text)

### Nodo 2: "HTML to PDF" 
Usa uno de estos nodos para convertir el HTML a PDF:

**Opción A: Gotenberg (Recomendado - Gratis)**
- Puedes desplegar Gotenberg en Easypanel también (es solo un contenedor)
- Imagen Docker: `gotenberg/gotenberg:8`
- Endpoint: `POST http://gotenberg:3000/forms/chromium/convert/html`

**Opción B: APITemplate.io**
- Servicio de pago pero tiene plan gratuito
- Más fácil de configurar

**Opción C: Nodo nativo de n8n "HTML to PDF"** (si existe en tu versión)

### Nodo 3: "Slack"
Usa el nodo de Slack para subir el archivo PDF generado.

## Resumen del Flujo
1.  **Webhook / Slack Trigger**: Recibe la solicitud.
2.  **AI Agent**: Procesa datos y crea el JSON.
3.  **HTTP Request (Tu API)**: Envía JSON → Recibe HTML.
4.  **HTML to PDF**: Convierte HTML → PDF.
5.  **Slack**: Envía el PDF al usuario.
