import express from 'express';
import { getAvailabilitiesByDateRange, insertAvailability, getHostAvailabilities } from '../db';
import { toDbRow, fromDbRow } from '@stay-with-friends/shared-types';
import { validateDateRange } from '@stay-with-friends/shared-utils';
import crypto from 'crypto';

const router = express.Router();

router.get('/availabilities/by-date', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  const rows = getAvailabilitiesByDateRange.all(date, date) as unknown[];
  res.json(rows.map((r) => fromDbRow('Availability', r as Record<string, unknown>)));
});

router.get('/availabilities/by-date-range', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });
  const rows = getAvailabilitiesByDateRange.all(endDate, startDate) as unknown[];
  res.json(rows.map((r) => fromDbRow('Availability', r as Record<string, unknown>)));
});

router.get('/hosts/:id/availabilities', (req, res) => {
  const rows = getHostAvailabilities.all(req.params.id) as unknown[];
  res.json(rows.map((r) => fromDbRow('Availability', r as Record<string, unknown>)));
});

router.post('/availabilities', (req, res) => {
  try {
    validateDateRange(req.body.start_date, req.body.end_date);
  const row = toDbRow('Availability', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
  const values = ['id','host_id','start_date','end_date','status','notes'].map((k) => (k in row ? row[k] : null));
  insertAvailability.run(...values);
  res.status(201).json({ id: row.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
