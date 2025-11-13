# FollowUP Copilot — AgentKit embebido

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Built_with-Next.js-000000)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

> Experiencia ultra responsiva y minimalista que combina AgentKit + ChatKit para ejecutar el workflow `wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473` (versión 1) directamente desde un panel web.

## Experiencia de interfaz

- Landing en `index` totalmente responsive, con hero contextual, métricas en vivo y el panel embebido.
- Logotipo oficial de FUP utilizado en la cabecera y como favicon optimizado.
- Toggle de tema claro/oscuro sincronizado con el web component.
- Contenedor del chat con efecto vidrio, overlay de errores y altura dinámica para mobile/desktop.

## Flujo del agente

1. `Query rewrite` (modelo `gpt-5-nano`, razonamiento *low*) reescribe la consulta del usuario para alinearla al conocimiento cargado.
2. `Classify` usa `fileSearchTool` sobre `vs_6914c9aa286081918e8328d262700bbb` y decide entre los modos `q-and-a`, `fact-finding` u `other`.
3. Dependiendo del resultado ejecuta `internalQA`, `externalFactFinding` o un agente auxiliar que pide más contexto.
4. Toda la orquestación corre en el workflow `wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473`, invocado desde [`functions/api/create-session.ts`](functions/api/create-session.ts) con sesiones persistentes vía cookie.

## Configuración rápida

1. **Instala dependencias**

   ```bash
   npm install
   ```

2. **Crea tu archivo de entorno**

   ```bash
   cp .env.example .env.local
   ```

3. **Completa las variables**

- `OPENAI_API_KEY`: clave del mismo proyecto/organización donde vive el workflow. Recuerda limpiar cualquier `OPENAI_API_KEY` exportada en tu shell (`unset OPENAI_API_KEY`).
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` *(opcional)*: el repo ya apunta al workflow `wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473`. Cambia este valor si publicas una versión diferente.
- `CHATKIT_API_BASE` *(opcional)*: URL personalizada si usas un endpoint distinto al de OpenAI.
- `NEXT_PUBLIC_BUILD_ID` *(opcional)*: etiqueta visible en la UI para saber qué build está desplegado (útil para QA). Puedes usar un timestamp, tag de release o dejarlo en `local-dev`.

4. **Ejecuta la app**

   ```bash
   npm run dev
   ```

   Visita `http://localhost:3000`, usa las tarjetas de inicio para probar prompts y cambia el tema para verificar el control bidireccional.

5. **Construye o despliega**

   ```bash
   npm run build
   npm start
   ```

   Antes de exponer la app, agrega tu dominio a la [Domain allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist) del dashboard de OpenAI.

## Personalización

- Ajusta prompts, saludo y esquema de color en [`lib/config.ts`](lib/config.ts).
- Modifica la experiencia visual en [`app/App.tsx`](app/App.tsx) y los estilos globales en [`app/globals.css`](app/globals.css).
- Extiende los manejadores `onWidgetAction` / `onResponseEnd` en [`components/ChatKitPanel.tsx`](components/ChatKitPanel.tsx) para guardar contexto, enviar analíticas o disparar automatizaciones.

## Recursos útiles

- [Guía oficial de ChatKit](https://platform.openai.com/docs/guides/chatkit)
- [Ejemplos avanzados AgentKit + ChatKit](https://github.com/openai/openai-chatkit-advanced-samples)
- [Agent Builder](https://platform.openai.com/agent-builder)

## Despliegue en Cloudflare Pages (plan Free)

Sigue estos pasos para tener frontend + endpoint seguro en un único proyecto:

1. **Verifica la configuración del repo**  
   - `next.config.ts` ya incluye `output: "export"` e `images.unoptimized`.  
   - El endpoint vive en `functions/api/create-session.ts`; usa las mismas cookies y headers que la ruta de Next.

2. **Conecta el repositorio en Cloudflare**  
   - Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → menú **Workers & Pages** → botón **Create application**.  
   - Elige **Pages → Connect to Git** y autoriza tu cuenta de GitHub.  
   - Selecciona este repo y la rama (ej. `main`).

3. **Configura el build**  
   - Framework preset: **Next.js**.  
   - Build command: `npm run build`.  
   - Build output directory: `.vercel/output/static`.  
   - Root directory: déjalo vacío (usa la raíz del repo).

4. **Declara variables de entorno** (sección *Environment variables* en el mismo formulario):  
   - `OPENAI_API_KEY` → clave del proyecto (Production + Preview).  
   - `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` → `wf_691498ab3cd08190b31a1ecadd223ed008ae1288861d6473` (o la tuya).  
   - `CHATKIT_API_BASE` → opcional si usas un endpoint distinto.  
   Continúa y Cloudflare iniciará el primer deploy.

5. **Confirma la Function**  
   - Tras el build ve a **Workers & Pages → tu proyecto** → pestaña **Functions** y verifica que `/api/create-session` aparezca.  
   - Si no, asegúrate de que `functions/api/create-session.ts` esté en la rama y vuelve a desplegar desde la pestaña **Deployments**.

6. **Prueba en local antes de publicar**  
   - Instala Wrangler (`npm install -g wrangler`).  
   - Ejecuta `wrangler pages dev . -- npm run build` para levantar el sitio + Function en `http://localhost:8788`.  
   - Envía un `curl -X POST http://localhost:8788/api/create-session` para validar que devuelve `client_secret`.

7. **Verifica el entorno publicado**  
   - Abre la URL `https://<tu-proyecto>.pages.dev`, inicia una conversación y revisa en DevTools → Network que `/api/create-session` responde `200`.  
   - Cuando todo funcione, añade tu dominio propio en **Workers & Pages → Custom domains** y actualiza los DNS.

Estos pasos dejan todo el flujo (assets estáticos + función edge) dentro de tu cuenta Cloudflare, usando únicamente la capa gratuita.

---

Construido con Next.js 15 + Tailwind CSS 4 y licenciado bajo MIT.
