import express from "express";
import sqlite3 from "sqlite3";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const dbFile = "./mknmsg.db";

const mdit = new MarkdownIt({
  html: false,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return "";
  },
});

export function initDatabase() {
  const db = new sqlite3.Database(dbFile);
  const createSql = `
    CREATE TABLE IF NOT EXISTS mknmsg (
        thread      TEXT    NOT NULL,
        message     TEXT    NOT NULL,
        author      TEXT    NOT NULL,
        datetime    TEXT    NOT NULL
    )`.trim();
  db.serialize(() => db.run(createSql));
  db.close();
}

export async function listThread(req: express.Request, res: express.Response) {
  const db = new sqlite3.Database(dbFile);
  const listSql = `SELECT DISTINCT thread FROM mknmsg ORDER BY datetime DESC`;
  const rows: any[] = await new Promise((r) =>
    db.serialize(() => db.all(listSql, (err, rows) => r(rows)))
  );
  db.close();
  res.render("list.ejs", { list: rows.map((e) => e.thread) });
}

export function createThread(req: express.Request, res: express.Response) {
  if (!req.body.thread || !req.body.message) {
    res.status(422).type("text/plain").send("422\r\n");
    return;
  }
  const db = new sqlite3.Database(dbFile);
  const createSql = `
    INSERT INTO mknmsg (thread, message, author, datetime)
        VALUES (?, ?, ?, ?)`.trim();
  db.run(
    createSql,
    req.body.thread,
    req.body.message,
    req.body.author || "Anonymous",
    new Date().toJSON()
  );
  db.close();
  res
    .status(303)
    .header("Location", `./${encodeURIComponent(req.body.thread)}`)
    .type("text/plain")
    .send("303\r\n");
}

export async function showThread(req: express.Request, res: express.Response) {
  const db = new sqlite3.Database(dbFile);
  const showSql = `SELECT * FROM mknmsg WHERE thread = ? ORDER BY datetime`;
  const rows: any[] = await new Promise((r) =>
    db.serialize(() =>
      db.all(showSql, [req.params.thread], (err, rows) => r(rows))
    )
  );
  db.close();
  res.render("show.ejs", {
    thread: req.params.thread,
    messages: rows.map((x) => {
      x.message = mdit.render(x.message);
      x.datetime = new Date(x.datetime).toLocaleString();
      return x;
    }),
  });
}

export function writeThread(req: express.Request, res: express.Response) {
  if (!req.body.message || !req.params.thread) {
    res.status(422).type("text/plain").send("422\r\n");
    return;
  }
  const db = new sqlite3.Database(dbFile);
  const createSql = `
    INSERT INTO mknmsg (thread, message, author, datetime)
        VALUES (?, ?, ?, ?)`.trim();
  db.run(
    createSql,
    req.params.thread,
    req.body.message,
    req.body.author || "Anonymous",
    new Date().toJSON()
  );
  db.close();
  res
    .status(303)
    .header("Location", `./${encodeURIComponent(req.params.thread)}`)
    .type("text/plain")
    .send("303\r\n");
}
