import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";
import cors from "@fastify/cors";
import fs from "fs";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

// Compatibilidade com o build atual do projeto.
let __dirname: string;

if (typeof __filename === "undefined") {
  const filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(filename);
} else {
  __dirname = path.dirname(require.main!.filename);
}

const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: "*",
});

const VIDEOS_DIR =
  process.env.VIDEOS_DIR || path.join(__dirname, "../../videos");

fastify.register(fastifyStatic, {
  root: VIDEOS_DIR,
  prefix: "/videos/",
});

// SQLite
const DATABASE_FILE =
  process.env.DATABASE_FILE ||
  path.resolve(__dirname, "../../data/english.sqlite");

fs.mkdirSync(path.dirname(DATABASE_FILE), {
  recursive: true,
});

const db = new Database(DATABASE_FILE);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS backups (
    user_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

// Dois usuários fixos.
const USERS = [
  { id: "oscar", name: "Oscar", profile: 'https://i.imgur.com/Jlp2Slc.jpeg' },
  { id: "mari", name: "Mariana", profile: 'https://i.imgur.com/xT1z8nw.png' },
] as const;

type UserId = (typeof USERS)[number]["id"];

function isValidUserId(userId: string): userId is UserId {
  return USERS.some((user) => user.id === userId);
}

const findBackup = db.prepare(`
  SELECT data
  FROM backups
  WHERE user_id = ?
`);

const saveBackup = db.prepare(`
  INSERT INTO backups (user_id, data, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    data = excluded.data,
    updated_at = excluded.updated_at
`);

// Lista os usuários disponíveis.
fastify.get("/users", async () => {
  return USERS;
});

// Busca o progresso de um usuário.
fastify.get<{ Params: { userId: string } }>(
  "/backup/:userId",
  async (request, reply) => {
    const { userId } = request.params;

    if (!isValidUserId(userId)) {
      return reply.code(404).send({
        success: false,
        error: "User not found",
      });
    }

    try {
      const backup = findBackup.get(userId) as { data: string } | undefined;

      // Usuário ainda sem progresso.
      if (!backup) {
        return {};
      }

      return {
        backup: JSON.parse(backup.data),
        user: USERS.find((user) => user.id === userId)
      };
    } catch (err) {
      fastify.log.error({ err }, "Failed to load backup");

      return reply.code(500).send({
        success: false,
        error: "Failed to load backup",
      });
    }
  },
);

// Salva ou substitui o progresso de um usuário.
fastify.post<{ Params: { userId: string } }>(
  "/backup/:userId",
  async (request, reply) => {
    const { userId } = request.params;

    if (!isValidUserId(userId)) {
      return reply.code(404).send({
        success: false,
        error: "User not found",
      });
    }

    const data = request.body;

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return reply.code(400).send({
        success: false,
        error: "Backup must be a JSON object",
      });
    }

    try {
      const serializedData = JSON.stringify(data);

      if (serializedData === undefined) {
        return reply.code(400).send({
          success: false,
          error: "Invalid backup data",
        });
      }

      const updatedAt = new Date().toISOString();

      saveBackup.run(userId, serializedData, updatedAt);

      return reply.send({
        success: true,
        userId,
        updatedAt,
      });
    } catch (err) {
      fastify.log.error({ err }, "Failed to save backup");

      return reply.code(500).send({
        success: false,
        error: "Failed to save backup",
      });
    }
  },
);

const start = async () => {
  try {
    await fastify.listen({
      port: 8888,
      host: "0.0.0.0",
    });

    fastify.log.info("Server is running on port 8888");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
