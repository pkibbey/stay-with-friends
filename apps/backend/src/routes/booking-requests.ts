import express from 'express';
import { insertBookingRequest, getBookingRequestsByHost, getBookingRequestsByRequester, updateBookingRequestStatus, getBookingRequestById } from '../db';
import { toDbRow, fromDbRow } from '@stay-with-friends/shared-types';
import { validateDateRange } from '@stay-with-friends/shared-utils';
import crypto from 'crypto';

const router = express.Router();

router.get('/booking-requests/host/:hostId', (req, res) => {
  const rows = getBookingRequestsByHost.all(req.params.hostId) as unknown[];
  res.json(rows.map((r) => fromDbRow('BookingRequest', r as Record<string, unknown>)));
});

router.get('/booking-requests/requester/:requesterId', (req, res) => {
  const rows = getBookingRequestsByRequester.all(req.params.requesterId) as unknown[];
  res.json(rows.map((r) => fromDbRow('BookingRequest', r as Record<string, unknown>)));
});

router.get('/booking-requests/:id', (req, res) => {
  const reqObj = getBookingRequestById.get(req.params.id);
  if (!reqObj) return res.status(404).json({ error: 'Booking request not found' });
  res.json(fromDbRow('BookingRequest', reqObj as Record<string, unknown>));
});

router.post('/booking-requests', (req, res) => {
  try {
    validateDateRange(req.body.start_date, req.body.end_date);
  const row = toDbRow('BookingRequest', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
  const values = ['id','host_id','requester_id','start_date','end_date','guests','message','status'].map((k) => (k in row ? row[k] : null));
  insertBookingRequest.run(...values);
  res.status(201).json({ id: row.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/booking-requests/:id/status', (req, res) => {
  try {
    const { status, response_message } = req.body;
    if (!status) throw new Error('status required');
    const result = updateBookingRequestStatus.run(status, response_message, req.params.id);
    res.json({ changes: result.changes });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
