# 🏫 NiceKids Daycare Center - Guía de Instalación Local

Sistema de gestión para guardería con 3 servicios independientes: API CRUD, API Business y Cliente React.

## 📋 Requisitos Previos

- **Node.js** versión 18 o superior
- **npm** o **yarn**
- Cuenta de **Supabase** (ya configurada)

## 🚀 Instalación Rápida

### 1️⃣ Clonar el repositorio (si aún no lo tienes)
```bash
git clone <url-del-repositorio>
cd T1-CodeSync-AWD-Daycare-center
```

### 2️⃣ Configurar Variables de Entorno

#### **API CRUD** (`api-crud/`)
Crea el archivo `.env` en la carpeta `api-crud/`:
```bash
cd api-crud
```

Crea un archivo `.env` con:
```env
PORT=3001
SUPABASE_URL=https://dkfissjbxaevmxcqvpai.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA3NDc2MiwiZXhwIjoyMDc4NjUwNzYyfQ.PKpjl12ijgNy9qAagwoqWpmdKGNVXJ8dMBXrNXNvTOU
```

#### **API Business** (`api-business/`)
Crea el archivo `.env` en la carpeta `api-business/`:
```bash
cd ../api-business
```

Crea un archivo `.env` con:
```env
PORT=3002
SUPABASE_URL=https://dkfissjbxaevmxcqvpai.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzA3NDc2MiwiZXhwIjoyMDc4NjUwNzYyfQ.PKpjl12ijgNy9qAagwoqWpmdKGNVXJ8dMBXrNXNvTOU
```

#### **Cliente React** (`client/`)
Crea el archivo `.env` en la carpeta `client/`:
```bash
cd ../client
```

Crea un archivo `.env` con:
```env
VITE_API_CRUD_URL=http://localhost:3001
VITE_API_BUSINESS_URL=http://localhost:3002
VITE_SUPABASE_URL=https://dkfissjbxaevmxcqvpai.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI
VITE_GOOGLE_CLIENT_ID=132351690242-pu2s0jq83q1oodg
```

### 3️⃣ Instalar Dependencias

Desde la raíz del proyecto, ejecuta:

```bash
# Instalar dependencias de API CRUD
cd api-crud
npm install

# Instalar dependencias de API Business
cd ../api-business
npm install

# Instalar dependencias del Cliente
cd ../client
npm install
```

### 4️⃣ Iniciar los Servicios

Necesitas **3 terminales** diferentes (PowerShell o CMD):

#### Terminal 1 - API CRUD (Puerto 3001)
```bash
cd api-crud
npm run dev
```
✅ Debería mostrar: `Server running on port 3001`

#### Terminal 2 - API Business (Puerto 3002)
```bash
cd api-business
npm run dev
```
✅ Debería mostrar: `Server running on port 3002`

#### Terminal 3 - Cliente React (Puerto 5173)
```bash
cd client
npm run dev
```
✅ Debería mostrar: `Local: http://localhost:5173/`

### 5️⃣ Acceder a la Aplicación

Abre tu navegador en:
```
http://localhost:5173
```

## 🏗️ Arquitectura del Proyecto

```
┌─────────────────┐
│  Cliente React  │ :5173
│   (Vite + TW)   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼────┐ ┌──▼─────────┐
│API CRUD│ │API Business│
│  :3001 │ │   :3002    │
└───┬────┘ └──┬─────────┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │ Supabase│
    │   DB    │
    └─────────┘
```

### Servicios:

- **Cliente** (`client/`): Frontend React + Vite + Tailwind CSS
- **API CRUD** (`api-crud/`): Operaciones básicas de datos
- **API Business** (`api-business/`): Lógica de negocio (pagos, notificaciones, reportes)

## 🛠️ Scripts Disponibles

### API CRUD & API Business
```bash
npm start      # Modo producción
npm run dev    # Modo desarrollo con hot-reload
```

### Cliente
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

## 📝 Notas Importantes

1. **Orden de inicio**: Inicia primero las APIs (CRUD y Business) antes del cliente
2. **Puertos**: Asegúrate de que los puertos 3001, 3002 y 5173 estén disponibles
3. **Node.js**: Requiere Node.js 18+ por el uso de `--watch` y `--env-file`
4. **Variables de entorno**: Verifica que los archivos `.env` estén correctamente creados

## 🐛 Solución de Problemas

### Error: "Cannot find module"
```bash
# Elimina node_modules e reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Cambia el puerto en el archivo .env correspondiente
# O detén el proceso que está usando ese puerto
```

### Error de conexión a Supabase
- Verifica que las URLs y keys en los archivos `.env` sean correctas
- Revisa tu conexión a internet

## 📞 Contacto

Para cualquier problema, revisa la documentación en `RESUMEN_IMPLEMENTACION.md`

---

**Equipo CodeSync** - Desarrollo Web Avanzado 2026
