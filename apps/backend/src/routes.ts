
// ...existing code...

import express from 'express';
import hostsRouter from './routes/hosts';
import availabilitiesRouter from './routes/availabilities';
import bookingRequestsRouter from './routes/booking-requests';
import usersRouter from './routes/users';
import connectionsRouter from './routes/connections';
import invitationsRouter from './routes/invitations';
import statsRouter from './routes/stats';

const router = express.Router();

// Compose sub-routers. They register routes relative to this router and index.ts mounts this at /api
router.use(hostsRouter);
router.use(availabilitiesRouter);
router.use(bookingRequestsRouter);
router.use(usersRouter);
router.use(connectionsRouter);
router.use(invitationsRouter);
router.use(statsRouter);

export default router;
