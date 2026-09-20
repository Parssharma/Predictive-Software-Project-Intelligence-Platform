import express, { type Express } from 'express';
import pino from 'pino';
import { healthRouter } from './routes/health.js';

const logger = pino({ transport: { target: 'pino-pretty' } });

const app: Express = express();
app.use(express.json());
app.use(healthRouter);

const port = Number(process.env['PORT']) || 4000;

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});

export { app };
