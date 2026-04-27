import { buildApp } from "./app";
import { env } from "./config/env";

const app = buildApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`╔═══════════════════════════════════════════════════════╗`);
  console.log(`║  Crystal Trade Hub API`);
  console.log(`║  ▸ Port:    ${env.port}`);
  console.log(`║  ▸ Env:     ${env.nodeEnv}`);
  console.log(`║  ▸ Health:  http://localhost:${env.port}/health`);
  console.log(`║  ▸ API:     http://localhost:${env.port}/api`);
  console.log(`║  ▸ CORS:    ${env.corsOrigins.join(", ")}`);
  console.log(`╚═══════════════════════════════════════════════════════╝`);
});
