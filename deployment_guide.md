# Guía de Despliegue en Easypanel

Easypanel es una excelente opción para montar esto. La forma más fácil y recomendada es conectar tu repositorio de GitHub.

## Opción Recomendada: Vía GitHub

Esta opción permite que cada vez que hagas un cambio en el código, Easypanel actualice tu API automáticamente.

### Paso 1: Subir el código a GitHub
1.  Crea un **nuevo repositorio** en tu cuenta de GitHub (puedes llamarlo `cotizador-ia-api`).
2.  Sube todos los archivos de esta carpeta al repositorio:
    *   `Dockerfile`
    *   `package.json`
    *   `server.js`
    *   `generate_quote.js`
    *   `template.html`
    *   (No subas `node_modules` ni archivos de prueba).

### Paso 2: Configurar Easypanel
1.  Entra a tu panel de Easypanel.
2.  Crea un nuevo **Project** (ej. "Cotizador").
3.  Haz clic en **+ Service** y selecciona **App**.
4.  En "Source", selecciona **GitHub**.
    *   Si es la primera vez, tendrás que conectar tu cuenta de GitHub.
5.  Selecciona el repositorio `cotizador-ia-api` que acabas de crear.
6.  **Configuración de Build**:
    *   Easypanel detectará automáticamente el `Dockerfile`.
    *   Asegúrate de que el "Build Type" sea **Dockerfile**.
    *   **Ruta de compilación (Build Path)**: Pon `/` (ya que el Dockerfile está en la raíz).
7.  **Configuración de Puerto**:
    *   En la sección "Network" o "Port", asegúrate de que esté escuchando en el puerto `3000` (que es el que definimos en el código).
8.  Haz clic en **Create** o **Deploy**.

### Paso 3: Obtener tu URL
Una vez desplegado, Easypanel te dará una URL pública (ej. `https://cotizador-ia-api.tu-dominio.com`).
Esa es la URL que usarás en n8n: `https://cotizador-ia-api.tu-dominio.com/api/quote`.

---

## Opción Alternativa: Docker Image (Avanzado)

Si no quieres usar GitHub, puedes construir la imagen en tu computadora y subirla a Docker Hub, pero es más tedioso.

1.  `docker build -t tu-usuario/cotizador-api .`
2.  `docker push tu-usuario/cotizador-api`
3.  En Easypanel, seleccionas "Docker Image" en lugar de GitHub y pones `tu-usuario/cotizador-api`.

**Recomendación**: Usa la opción de GitHub. Es mucho más fácil de mantener.
