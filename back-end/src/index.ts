import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routers/router';
import { ConfigEnv } from './config/constEnv';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use('/api', router);

app.listen(ConfigEnv.port, () => {
  console.log(`Servidor corriendo en el puerto ${ConfigEnv.port}`);
});
