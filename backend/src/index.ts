import app from "./app";
import env from "./config/env";

const PORT = env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Bright Star Backend API listening on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Health check endpoint: http://localhost:${PORT}/api/health`);
});

export default server;
