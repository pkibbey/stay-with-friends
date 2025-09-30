import express from 'express';
import { getConnections, getConnectionRequests, insertConnection, updateConnectionStatus } from '../db';
import { toDbRow, fromDbRow } from '@stay-with-friends/shared-types';
import crypto from 'crypto';

const router = express.Router();

router.get('/connections/:userId', (req, res) => {
  const rows = getConnections.all(req.params.userId, req.params.userId, req.params.userId) as unknown[];
  res.json(rows.map((r) => fromDbRow('Connection', r as Record<string, unknown>)));
});

router.get('/connection-requests/:userId', (req, res) => {
  const rows = getConnectionRequests.all(req.params.userId) as unknown[];
  res.json(rows.map((r) => fromDbRow('Connection', r as Record<string, unknown>)));
});

router.post('/connections', (req, res) => {
  try {
  const row = toDbRow('Connection', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
  const values = ['id','user_id','connected_user_id','relationship','status'].map((k) => (k in row ? row[k] : null));
  insertConnection.run(...values);
  res.status(201).json({ id: row.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/connections/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) throw new Error('status required');
    const result = updateConnectionStatus.run(status, req.params.id);
    res.json({ changes: result.changes });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
