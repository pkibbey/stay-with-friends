import express from 'express';
import crypto from 'crypto';
import { getAllHosts, getHostById, insertHost, searchHosts, getHostAvailabilities } from '../db';
import { validateName, toDbRow, fromDbRow, Host } from '@stay-with-friends/shared-types';

const router = express.Router();

router.get('/hosts', (req, res) => {
  const rows = getAllHosts.all() as unknown[];
  const parsed = rows.map((r) => fromDbRow('Host', r as Host));
  res.json(parsed);
});

router.get('/hosts/:id', (req, res) => {
  const host = getHostById.get(req.params.id);
  if (!host) return res.status(404).json({ error: 'Host not found' });
  res.json(fromDbRow('Host', host as Record<string, unknown>));
});

router.get('/hosts/:id/availabilities', (req, res) => {
  res.json(getHostAvailabilities.all(req.params.id));
});

router.get('/hosts/search/:query', (req, res) => {
  const q = `%${req.params.query}%`;
  const rows = searchHosts.all(q, q) as unknown[];
  res.json(rows.map((r) => fromDbRow('Host', r as Record<string, unknown>)));
});

router.post('/hosts', (req, res) => {
  try {
    validateName(req.body.name);
    // Build a DB-safe row using shared-types helper, then map to the exact column order used by the prepared statement
  const body = { ...req.body } as Record<string, unknown>;
  // ensure id exists
  if (!body.id) body.id = crypto.randomUUID();

  const row = toDbRow('Host', body);

    // column order must match the INSERT statement in db.ts
    const insertOrder = [
      'id','user_id','name','location','description','address','city','state','zip_code','country',
      'latitude','longitude','amenities','house_rules','check_in_time','check_out_time','max_guests','bedrooms','bathrooms','photos'
    ];

    const values = insertOrder.map((k) => (k in row ? row[k] : null));

  insertHost.run(...values);
  res.status(201).json({ id: body.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
