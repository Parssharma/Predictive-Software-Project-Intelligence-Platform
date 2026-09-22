import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pino from 'pino';
import { env } from './env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { githubRouter } from './routes/github.js';
import { connectRouter } from './routes/connect.js';
import { webhookRouter } from './routes/webhooks.js';

const logger = pino({ transport: { target: 'pino-pretty' } });

const app: Express = express();

// CORS — allow frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

// Parse cookies
app.use(cookieParser());

// Parse JSON body (must come before routes)
app.use(express.json());

// Mount routes
app.use(healthRouter);
app.use(authRouter);
app.use(githubRouter);
app.use(connectRouter);
app.use(webhookRouter);

const port = env.PORT;

app.listen(port, () => {
  logger.info(`API server listening on port ${port}`);
});

export { app };
