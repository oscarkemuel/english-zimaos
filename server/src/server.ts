import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import cors from '@fastify/cors'
import fs from 'fs';
import { fileURLToPath } from 'url';

// Verifique se estamos em um ambiente CommonJS ou ESModule
let __dirname;
if (typeof __filename === 'undefined') {
  // Estamos em um ambiente ESModule
  const __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} else {
  // Estamos em um ambiente CommonJS
  __dirname = path.dirname(require.main!.filename);
}

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: '*',
});

const VIDEOS_DIR = process.env.VIDEOS_DIR || path.join(__dirname, '../../videos');

fastify.register(fastifyStatic, {
  root: VIDEOS_DIR,
  prefix: '/videos/',
});

const BACKUP_FILE =
  process.env.BACKUP_FILE || path.resolve(__dirname, '../../backup.json');

fastify.post('/backup', async (request, reply) => {
  const data = request.body;

  try {
    fs.writeFileSync(
      BACKUP_FILE,
      JSON.stringify(data, null, 2)
    );

    reply.send({ success: true });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({
      success: false,
      error: 'Failed to save backup'
    });
  }
});

fastify.get("/backup", async (_request, reply) => {
  try {
    if (!fs.existsSync(BACKUP_FILE)) {
      return reply.send({});
    }

    const content = fs.readFileSync(BACKUP_FILE, "utf-8");
    const data = JSON.parse(content);

    return reply.send(data);
  } catch (err) {
    fastify.log.error(err);

    return reply.status(500).send({
      success: false,
      error: "Failed to load backup",
    });
  }
});


const start = async () => {
  try {
    await fastify.listen({ port: 8888, host: '0.0.0.0' });
    fastify.log.info(`Server is running at http://localhost:8888`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
