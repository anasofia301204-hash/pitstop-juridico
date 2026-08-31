# 🏎️ PitStop Judicial | Legal Telemetry Colombia ⚖️

Plataforma de alta telemetría para la gestión, vigilancia y control de términos judiciales en Colombia con diseño inspirado en la Fórmula 1, conexión directa con la API v2 de la **Rama Judicial de Colombia**, protocolo de contingencia **Safety Car** y alertas automáticas por **WhatsApp** a despachos.

---

## 🌟 Características Principales

1. **Scouting & Radar Judicial:** Búsqueda en tiempo real por número de radicado de **23 dígitos** (`11001-31-03-015-2023-00482-00`) o por **Nombre / Razón Social**.
2. **El Garaje (Watchlist Central):** Repositorio central de expedientes con **Semáforo F1** (🔴 Bandera Roja para términos &lt; 72h, 🟡 Pit Alert para novedades ≤ 3 días, 🟢 En Carrera).
3. **Motor V6 Turbo Híbrido & Protocolo Safety Car:** Conexión con la API v2 de la Rama Judicial con tolerancia a fallos, 2 reintentos automáticos y conmutación a caché local.
4. **Race Control & Cron Jobs:** Barrido automático a las **06:00 AM y 05:00 PM (Hora Colombia - UTC-5)** sincronizado con la publicación de estados electrónicos.
5. **PitWall WhatsApp Direct:** Plantilla oficial de notificación judicial formateada y despachada a **`+57 3196816770`**.

---

## 🏁 Despliegue en Producción (Paso a Paso)

Sigue estos 3 sencillos pasos para llevar tu aplicación al entorno de producción global en **Supabase** y **Vercel**:

### 1️⃣ Paso 1: Configurar la Base de Datos en Supabase
1. Ingresa a [https://supabase.com](https://supabase.com) e inicia sesión (o crea una cuenta gratuita).
2. Haz clic en **"New Project"**, asígnale un nombre (ej. `pitstop-judicial-db`) y una contraseña segura a la base de datos. Selecciona la región más cercana (ej: *East US / São Paulo*).
3. Una vez creado el proyecto, ve al menú lateral izquierdo y abre el **"SQL Editor"** (ícono de terminal `>_`).
4. Haz clic en **"New Query"**, copia todo el contenido del archivo [`supabase_migration.sql`](./supabase_migration.sql) de este repositorio y pégalo en el editor.
5. Haz clic en el botón verde **"Run"**. Esto creará automáticamente las tablas (`procesos`, `actuaciones_estados`, `configuracion_alertas`), las políticas de seguridad RLS, los índices B-Tree para 23 dígitos y los datos iniciales.
6. Dirígete a **Project Settings -> API** y copia:
   - **Project URL** (ej: `https://xyzcompany.supabase.co`)
   - **anon / public key** (ej: `eyJhbGciOi...`)
   - **service_role key** (clave secreta)

---

### 2️⃣ Paso 2: Subir el Código a tu Repositorio en GitHub
Si aún no has subido el proyecto a GitHub, ejecuta los siguientes comandos en tu terminal:

```bash
# 1. Inicializar git y agregar todos los archivos
git init
git add .
git commit -m "feat: PitStop Judicial v2 - Legal Telemetry Colombia listo para produccion"

# 2. Renombrar rama principal y vincular a tu repositorio de GitHub
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pitstop-judicial.git

# 3. Subir el código
git push -u origin main
```

---

### 3️⃣ Paso 3: Importar y Desplegar en Vercel con Cron Jobs
1. Ingresa a [https://vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." -> "Project"** y selecciona tu repositorio `pitstop-judicial`.
3. En la sección **"Environment Variables"**, despliega y añade las siguientes variables copiadas de tu `.env.example`:

| Nombre de la Variable | Valor | Descripción |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://tu-proyecto.supabase.co` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Clave pública Anon de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Clave secreta Service Role |
| `CRON_SECRET` | `tu_clave_secreta_aqui` | Token para asegurar el endpoint del cron |
| `WHATSAPP_TARGET_NUMBER` | `+573196816770` | Teléfono oficial del despacho/jefe |

4. Haz clic en **"Deploy"**. Vercel compilará la aplicación y la desplegará en un dominio global con HTTPS (ej. `https://pitstop-judicial.vercel.app`).
5. **Cron Jobs Automáticos:** Gracias a la configuración en [`vercel.json`](./vercel.json), Vercel programará de forma nativa la ejecución del endpoint `/api/cron/check-updates` todos los días a las **06:00 AM y 05:00 PM (Hora Colombia)**.

---

## 🛠️ Comandos de Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📄 Estructura del Proyecto

```text
├── api/
│   └── cron/
│       └── check-updates.ts      # Endpoint Serverless para el Cron de Vercel
├── src/
│   ├── components/               # Componentes UI (Garaje, Scouting, Race Control, etc.)
│   ├── lib/
│   │   └── supabaseClient.ts     # Cliente oficial de Supabase
│   ├── services/
│   │   ├── ramaJudicialRealApi.ts# Motor V6 Turbo Híbrido & Safety Car Protocol
│   │   ├── raceControlMonitor.ts # Lógica de barrido y comparación de actuaciones
│   │   └── whatsappService.ts    # Formateo y despacho de alertas WhatsApp
│   ├── types/                    # Tipos TypeScript para base de datos y telemetría
│   ├── App.tsx                   # Componente principal y enrutamiento
│   └── main.tsx                  # Entrada de la aplicación React
├── supabase_migration.sql        # Script SQL completo para Supabase PostgreSQL
├── vercel.json                   # Configuración de hosting y cron jobs para Vercel
├── .env.example                  # Plantilla de variables de entorno
└── package.json                  # Dependencias y scripts
```

---

*PitStop Judicial / Legal Telemetry © 2026 - Desarrollado para la vigilancia judicial de alto rendimiento en Colombia.* 🏎️⚖️
