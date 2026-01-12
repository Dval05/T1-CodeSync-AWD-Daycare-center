import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './src/routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api', routes);

app.get('/health', (req, res) => res.json({ status: 'API Business OK', time: new Date() }));

app.listen(PORT, () => {
    console.log(`API Business corriendo en puerto ${PORT}`);
});