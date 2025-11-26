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

Ahora tu flujo en n8n es mucho más simple. Solo necesitas un nodo **HTTP Request**.

### Nodo "HTTP Request"
*   **Method**: POST
*   **URL**: `https://tu-dominio-api.com/api/quote` (o `http://localhost:3000/api/quote` si es local).
*   **Body Content Type**: JSON
*   **Body Parameters**:
    *   Parameter Name: `zones`
    *   Value: `{{ $json.zones }}` (y el resto de campos: clientName, reference, date).
    *   *Tip: Puedes pasar todo el JSON que armaste en el paso anterior.*
*   **Response Format**: File (Binary)
*   **Property Name**: `data` (o como quieras llamar al archivo).

### Nodo "Slack"
Usa el nodo de Slack para subir el archivo PDF generado.

*   **Resource**: File
*   **Operation**: Upload
*   **Binary Property**: `data` (la misma propiedad que definiste en el nodo HTTP).

## Resumen del Flujo
1.  **Webhook / Slack Trigger**: Recibe la solicitud.
2.  **AI Agent**: Procesa datos y crea el JSON.
3.  **HTTP Request (Tu API)**: Envía JSON -> Recibe PDF.
4.  **Slack**: Envía el PDF al usuario.
