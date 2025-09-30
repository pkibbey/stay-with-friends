
// ...existing code...

import express from 'express';
import {
  getAllHosts, getHostById, insertHost, searchHosts, getHostAvailabilities, getAvailabilitiesByDateRange, insertAvailability, getAvailabilityDates,
  insertBookingRequest, getBookingRequestsByHost, getBookingRequestsByRequester, updateBookingRequestStatus, getBookingRequestById, getPendingBookingRequestsCountByHostUser,
  getUserByEmail, getUserById, insertUser, updateUser,
  getConnections, getConnectionRequests, insertConnection, updateConnectionStatus,
  insertInvitation, getInvitationByToken, getInvitationById, getInvitationsByInviter, updateInvitationStatus, getInvitationByEmail, deleteInvitation,
  getConnectionById, deleteConnectionsBetweenUsers, getConnectionBetweenUsers, searchHostsAvailableOnDate,
  getTotalBookingsCount, getTotalConnectionsCount, getTotalHostsCount
} from './db';
import { validateEmail, validateName } from '@stay-with-friends/shared-types';





// validateDateRange is not exported, so we redefine a local version here
const validateDateRange = (startDate: string, endDate: string): void => {
  if (!startDate || !endDate) {
    throw new Error('Start date and end date are required');
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }
  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }
};

const router = express.Router();


// HOSTS
router.get('/hosts', (req, res) => {
  res.json(getAllHosts.all());
});

router.get('/hosts/:id', (req, res) => {
  const host = getHostById.get(req.params.id);
  if (!host) return res.status(404).json({ error: 'Host not found' });
  res.json(host);
});

router.get('/hosts/:id/availabilities', (req, res) => {
  res.json(getHostAvailabilities.all(req.params.id));
});

router.get('/hosts/search/:query', (req, res) => {
  const q = `%${req.params.query}%`;
  res.json(searchHosts.all(q, q));
});

router.post('/hosts', (req, res) => {
  try {
    validateName(req.body.name);
    validateEmail(req.body.email);
    insertHost.run(
      req.body.id,
      req.body.user_id,
      req.body.name,
      req.body.location,
      req.body.description,
      req.body.address,
      req.body.city,
      req.body.state,
      req.body.zip_code,
      req.body.country,
      req.body.latitude,
      req.body.longitude,
      req.body.amenities,
      req.body.house_rules,
      req.body.check_in_time,
      req.body.check_out_time,
      req.body.max_guests,
      req.body.bedrooms,
      req.body.bathrooms,
      req.body.photos
    );
    res.status(201).json({ id: req.body.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// AVAILABILITIES
router.get('/availabilities/by-date', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  res.json(getAvailabilitiesByDateRange.all(date, date));
});

router.get('/availabilities/by-date-range', (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });
  res.json(getAvailabilitiesByDateRange.all(endDate, startDate));
});

router.get('/hosts/:id/availabilities', (req, res) => {
  res.json(getHostAvailabilities.all(req.params.id));
});

router.post('/availabilities', (req, res) => {
  try {
    validateDateRange(req.body.start_date, req.body.end_date);
    insertAvailability.run(
      req.body.id,
      req.body.host_id,
      req.body.start_date,
      req.body.end_date,
      req.body.status || 'available',
      req.body.notes
    );
    res.status(201).json({ id: req.body.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// BOOKING REQUESTS
router.get('/booking-requests/host/:hostId', (req, res) => {
  res.json(getBookingRequestsByHost.all(req.params.hostId));
});

router.get('/booking-requests/requester/:requesterId', (req, res) => {
  res.json(getBookingRequestsByRequester.all(req.params.requesterId));
});

router.get('/booking-requests/:id', (req, res) => {
  const reqObj = getBookingRequestById.get(req.params.id);
  if (!reqObj) return res.status(404).json({ error: 'Booking request not found' });
  res.json(reqObj);
});

router.post('/booking-requests', (req, res) => {
  try {
    validateDateRange(req.body.start_date, req.body.end_date);
    insertBookingRequest.run(
      req.body.id,
      req.body.host_id,
      req.body.requester_id,
      req.body.start_date,
      req.body.end_date,
      req.body.guests,
      req.body.message,
      req.body.status || 'pending'
    );
    res.status(201).json({ id: req.body.id });
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


// USERS
router.get('/users/email/:email', (req, res) => {
  const user = getUserByEmail.get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/users', (req, res) => {
  try {
    validateEmail(req.body.email);
    validateName(req.body.name);
    insertUser.run(
      req.body.id,
      req.body.email,
      req.body.name,
      req.body.email_verified,
      req.body.image
    );
    res.status(201).json({ id: req.body.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// PATCH /users/:id - update user name and/or image
router.patch('/users/:id', (req, res) => {
  const { name, image } = req.body;
  if (!name && !image) {
    return res.status(400).json({ error: 'At least one of name or image must be provided' });
  }
  try {
    // Only update provided fields
    const user = getUserById.get(req.params.id) as { name?: string; image?: string } | undefined;
    if (!user) return res.status(404).json({ error: 'User not found' });
    const newName = name !== undefined ? name : user.name;
    const newImage = image !== undefined ? image : user.image;
    // Optionally validate name if provided
    if (name !== undefined) validateName(name);
    updateUser.run(newName, newImage, req.params.id);
    res.json({ id: req.params.id, name: newName, image: newImage });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// CONNECTIONS
router.get('/connections/:userId', (req, res) => {
  res.json(getConnections.all(req.params.userId, req.params.userId, req.params.userId));
});

router.get('/connection-requests/:userId', (req, res) => {
  res.json(getConnectionRequests.all(req.params.userId));
});

router.post('/connections', (req, res) => {
  try {
    insertConnection.run(
      req.body.id,
      req.body.user_id,
      req.body.connected_user_id,
      req.body.relationship,
      req.body.status || 'pending'
    );
    res.status(201).json({ id: req.body.id });
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

// INVITATIONS
router.get('/invitations/token/:token', (req, res) => {
  const invitation = getInvitationByToken.get(req.params.token);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
  res.json(invitation);
});

router.post('/invitations', (req, res) => {
  try {
    insertInvitation.run(
      req.body.id,
      req.body.inviter_id,
      req.body.invitee_email,
      req.body.message,
      req.body.token,
      req.body.expires_at
    );
    res.status(201).json({ id: req.body.id });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.put('/invitations/:id/status', (req, res) => {
  try {
    const { status, accepted_at } = req.body;
    if (!status) throw new Error('status required');
    const result = updateInvitationStatus.run(status, accepted_at, req.params.id);
    res.json({ changes: result.changes });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

router.delete('/invitations/:id', (req, res) => {
  try {
    const result = deleteInvitation.run(req.params.id);
    res.json({ changes: result.changes });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// AGGREGATES
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
