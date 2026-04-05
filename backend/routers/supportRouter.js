import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { randomUUID } from 'crypto';
import { execute } from '../db/client.js';
import { isAdmin, isAuth } from '../utils.js';

const supportRouter = express.Router();

supportRouter.get(
  '/threads',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    let sql = `
      SELECT t.*, u.name AS user_name
      FROM support_threads t
      JOIN users u ON u.id = t.user_id
    `;
    const args = [];

    if (!req.user.isAdmin) {
      sql += ' WHERE t.user_id = ?';
      args.push(req.user._id);
    }

    sql += ' ORDER BY t.last_message_at DESC';

    const threads = await execute(sql, args);
    res.send(
      threads.rows.map((thread) => ({
        _id: thread.id,
        user: {
          _id: thread.user_id,
          name: thread.user_name,
        },
        adminId: thread.admin_id,
        lastMessageAt: thread.last_message_at,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
      }))
    );
  })
);

supportRouter.get(
  '/threads/:id/messages',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const thread = (await execute('SELECT * FROM support_threads WHERE id = ?', [req.params.id])).rows[0];
    if (!thread) {
      res.status(404).send({ message: 'Thread not found' });
      return;
    }

    if (!req.user.isAdmin && thread.user_id !== req.user._id) {
      res.status(403).send({ message: 'Forbidden' });
      return;
    }

    const messages = await execute(
      'SELECT * FROM support_messages WHERE thread_id = ? ORDER BY created_at ASC',
      [req.params.id]
    );

    res.send(
      messages.rows.map((message) => ({
        _id: message.id,
        threadId: message.thread_id,
        senderId: message.sender_id,
        name: message.sender_name,
        body: message.body,
        createdAt: message.created_at,
      }))
    );
  })
);

supportRouter.post(
  '/threads',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const userId = req.user.isAdmin ? req.body.userId : req.user._id;
    if (!userId) {
      res.status(400).send({ message: 'userId is required' });
      return;
    }

    let thread = (
      await execute('SELECT * FROM support_threads WHERE user_id = ? ORDER BY created_at ASC LIMIT 1', [userId])
    ).rows[0];

    if (!thread) {
      const now = new Date().toISOString();
      const id = randomUUID();
      await execute(
        `INSERT INTO support_threads (id, user_id, admin_id, created_at, updated_at, last_message_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, userId, req.user.isAdmin ? req.user._id : null, now, now, now]
      );
      thread = (await execute('SELECT * FROM support_threads WHERE id = ?', [id])).rows[0];
    }

    res.status(201).send({ _id: thread.id, userId: thread.user_id, adminId: thread.admin_id });
  })
);

supportRouter.post(
  '/threads/:id/messages',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const thread = (await execute('SELECT * FROM support_threads WHERE id = ?', [req.params.id])).rows[0];
    if (!thread) {
      res.status(404).send({ message: 'Thread not found' });
      return;
    }

    if (!req.user.isAdmin && thread.user_id !== req.user._id) {
      res.status(403).send({ message: 'Forbidden' });
      return;
    }

    if (!req.body.body || !req.body.body.trim()) {
      res.status(400).send({ message: 'Message body is required' });
      return;
    }

    const now = new Date().toISOString();
    const id = randomUUID();
    await execute(
      `INSERT INTO support_messages (id, thread_id, sender_id, sender_name, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.params.id, req.user._id, req.user.name, req.body.body.trim(), now]
    );

    await execute('UPDATE support_threads SET updated_at = ?, last_message_at = ?, admin_id = ? WHERE id = ?', [
      now,
      now,
      req.user.isAdmin ? req.user._id : thread.admin_id,
      req.params.id,
    ]);

    res.status(201).send({
      _id: id,
      threadId: req.params.id,
      senderId: req.user._id,
      name: req.user.name,
      body: req.body.body.trim(),
      createdAt: now,
    });
  })
);

supportRouter.get(
  '/admin/users',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (_req, res) => {
    const users = await execute('SELECT id, name, email FROM users WHERE is_admin = 0 ORDER BY name ASC');
    res.send(
      users.rows.map((user) => ({
        _id: user.id,
        name: user.name,
        email: user.email,
      }))
    );
  })
);

export default supportRouter;
