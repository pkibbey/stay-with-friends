import express from 'express';
import { getConnections, getConnectionRequests, insertConnection, updateConnectionStatus } from '../db';
import { toDbRow, fromDbRow } from '@stay-with-friends/shared-types';
import crypto from 'crypto';

const router = express.Router();

router.get('/connections', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });
  const rows = getConnections.all(user_id, user_id, user_id) as unknown[];
  const connections = (rows as Record<string, unknown>[]).map((row) => {
    const connection = fromDbRow('Connection', row);
    return {
      ...connection,
      connectedUser: {
        id: row.connected_user_id,
        email: row.email,
        name: row.name,
        image: row.image,
      }
    };
  });
  res.json(connections);
});

router.get('/connection-requests/:userId', (req, res) => {
  const rows = getConnectionRequests.all(req.params.userId) as unknown[];
  const requests = (rows as Record<string, unknown>[]).map((row) => {
    const connection = fromDbRow('Connection', row);
    return {
      ...connection,
      requesterUser: {
        id: row.user_id,
        email: row.email,
        name: row.name,
        image: row.image,
      }
    };
  });
  res.json(requests);
});

router.post('/connections', (req, res) => {
  try {
  const row = toDbRow('Connection', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
  if (!row.status) row.status = 'pending'; // Set default status
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
