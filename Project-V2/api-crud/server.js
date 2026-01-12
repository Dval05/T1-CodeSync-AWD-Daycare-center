import 'dotenv/config'; 

console.log("--- DEBUG START ---");
console.log("Directorio actual:", process.cwd());
console.log("Supabase URL:", process.env.SUPABASE_URL ? "Cargada Correctamente" : "❌ FALTA / UNDEFINED");
console.log("Supabase Key:", process.env.SUPABASE_ANON_KEY ? "Cargada Correctamente" : "❌ FALTA / UNDEFINED");
console.log("--- DEBUG END ---");

import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.js';

if (!process.env.SUPABASE_URL) {
    console.error("⛔ ERROR CRÍTICO: No se leyó el archivo .env");
    console.error("Asegúrate de que el archivo .env está en la carpeta RAÍZ de api-crud");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({ status: 'API CRUD OK', time: new Date() });
});

app.listen(PORT, () => {
    console.log(`⚡ API CRUD (Datos) corriendo en puerto ${PORT}`);
});