import express from 'express';
import { getTotalHostsCount, getTotalConnectionsCount, getTotalBookingsCount } from '../db';

const router = express.Router();

router.get('/stats/hosts', (req, res) => {
  res.json(getTotalHostsCount.get());
});
router.get('/stats/connections', (req, res) => {
  res.json(getTotalConnectionsCount.get());
});
router.get('/stats/bookings', (req, res) => {
  res.json(getTotalBookingsCount.get());
});

export default router;
