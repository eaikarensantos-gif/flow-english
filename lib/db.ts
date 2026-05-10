/**
 * Database abstraction layer.
 * Uses @libsql/client/http for production (Turso) and better-sqlite3 for local dev.
 * This bypasses Prisma adapters entirely for maximum Vercel compatibility.
 */

import type { Song, LyricsLine, WordEnrichment } from "@/types";

// ── Client setup ────────────────────────────────────────────────────────────

interface DbClient {
  execute(sql: string, args?: unknown[]): Promise<{ rows: unknown[][] }>;
}

let _client: DbClient | null = null;

function getClient(): DbClient {
  if (_client) return _client;

  if (process.env.TURSO_DATABASE_URL) {
    // Production: pure HTTP client, no native bindings
    const { createClient } = require("@libsql/client/http");
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } else {
    // Local dev: better-sqlite3 wrapped to match the async interface
    const Database = require("better-sqlite3");
    const url = process.env.DATABASE_URL ?? "file:./dev.db";
    const filepath = url.replace("file:", "");
    const db = new Database(filepath);
    _client = {
      execute(sql: string, args: unknown[] = []) {
        try {
          const stmt = db.prepare(sql);
          if (sql.trim().toUpperCase().startsWith("SELECT")) {
            const rows = stmt.all(...args);
            // Convert object rows to arrays matching column order
            return Promise.resolve({ rows: rows.map((r: Record<string, unknown>) => Object.values(r)) });
          } else {
            stmt.run(...args);
            return Promise.resolve({ rows: [] });
          }
        } catch (e) {
          return Promise.reject(e);
        }
      },
    };
  }
  return _client!;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function row<T>(columns: string[], data: unknown[]): T {
  return Object.fromEntries(columns.map((c, i) => [c, data[i]])) as T;
}

// ── Songs ────────────────────────────────────────────────────────────────────

export async function getSongs(level?: string | null): Promise<Song[]> {
  const db = getClient();
  const sql = level
    ? `SELECT id,title,artist,album,year,level,coverUrl,geniusUrl,duration,tags,createdAt FROM Song WHERE level=? ORDER BY createdAt DESC`
    : `SELECT id,title,artist,album,year,level,coverUrl,geniusUrl,duration,tags,createdAt FROM Song ORDER BY createdAt DESC`;
  const res = await db.execute(sql, level ? [level] : []);
  const cols = ["id","title","artist","album","year","level","coverUrl","geniusUrl","duration","tags","createdAt"];
  return res.rows.map(r => row<Song>(cols, r as unknown[]));
}

export async function getSongById(id: string): Promise<Song | null> {
  const db = getClient();
  const res = await db.execute(
    `SELECT id,title,artist,album,year,level,coverUrl,geniusUrl,duration,tags,createdAt FROM Song WHERE id=?`,
    [id]
  );
  if (!res.rows.length) return null;
  const cols = ["id","title","artist","album","year","level","coverUrl","geniusUrl","duration","tags","createdAt"];
  return row<Song>(cols, res.rows[0] as unknown[]);
}

export async function createSong(data: {
  id: string; title: string; artist: string; album?: string; year?: number;
  level: string; coverUrl?: string; geniusUrl?: string; duration?: number; tags: string;
}): Promise<void> {
  const db = getClient();
  await db.execute(
    `INSERT INTO Song (id,title,artist,album,year,level,coverUrl,geniusUrl,duration,tags,createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
    [data.id, data.title, data.artist, data.album ?? null, data.year ?? null,
     data.level, data.coverUrl ?? null, data.geniusUrl ?? null, data.duration ?? null, data.tags]
  );
}

// ── LyricsLines ───────────────────────────────────────────────────────────────

export async function getLyricsLines(songId: string): Promise<LyricsLine[]> {
  const db = getClient();
  const res = await db.execute(
    `SELECT id,songId,lineIndex,text,startMs,endMs,translation,culturalNote,enrichedAt FROM LyricsLine WHERE songId=? ORDER BY lineIndex ASC`,
    [songId]
  );
  const cols = ["id","songId","lineIndex","text","startMs","endMs","translation","culturalNote","enrichedAt"];
  return res.rows.map(r => row<LyricsLine>(cols, r as unknown[]));
}

export async function createLyricsLines(lines: {
  id: string; songId: string; lineIndex: number; text: string;
  startMs?: number; endMs?: number;
}[]): Promise<void> {
  const db = getClient();
  for (const l of lines) {
    await db.execute(
      `INSERT OR IGNORE INTO LyricsLine (id,songId,lineIndex,text,startMs,endMs) VALUES (?,?,?,?,?,?)`,
      [l.id, l.songId, l.lineIndex, l.text, l.startMs ?? null, l.endMs ?? null]
    );
  }
}

export async function updateLyricsLine(songId: string, lineIndex: number, data: {
  translation?: string; culturalNote?: string | null;
}): Promise<void> {
  const db = getClient();
  await db.execute(
    `UPDATE LyricsLine SET translation=?, culturalNote=?, enrichedAt=datetime('now') WHERE songId=? AND lineIndex=?`,
    [data.translation ?? null, data.culturalNote ?? null, songId, lineIndex]
  );
}

// ── WordEnrichments ───────────────────────────────────────────────────────────

export async function getWordEnrichments(songId: string): Promise<WordEnrichment[]> {
  const db = getClient();
  const res = await db.execute(
    `SELECT id,songId,word,definition,partOfSpeech,example,difficulty,lineIndex FROM WordEnrichment WHERE songId=?`,
    [songId]
  );
  const cols = ["id","songId","word","definition","partOfSpeech","example","difficulty","lineIndex"];
  return res.rows.map(r => row<WordEnrichment>(cols, r as unknown[]));
}

export async function upsertWordEnrichment(data: {
  id: string; songId: string; word: string; definition: string;
  partOfSpeech: string; example: string; difficulty: string; lineIndex: number;
}): Promise<void> {
  const db = getClient();
  await db.execute(
    `INSERT OR IGNORE INTO WordEnrichment (id,songId,word,definition,partOfSpeech,example,difficulty,lineIndex)
     VALUES (?,?,?,?,?,?,?,?)`,
    [data.id, data.songId, data.word, data.definition, data.partOfSpeech, data.example, data.difficulty, data.lineIndex]
  );
}

export async function deleteSongs(): Promise<void> {
  const db = getClient();
  await db.execute(`DELETE FROM Song`, []);
}
