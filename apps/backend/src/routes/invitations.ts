import express from 'express';
import { getInvitationByToken, getAllInvitations, insertInvitation, updateInvitationStatus, deleteInvitation, getInvitationByEmail } from '../db';
import { toDbRow, fromDbRow, CreateInvitationSchema } from '@stay-with-friends/shared-types';
import crypto from 'crypto';

const router = express.Router();

router.get('/invitations/token/:token', (req, res) => {
  const invitation = getInvitationByToken.get(req.params.token);
  if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
  res.json(fromDbRow('Invitation', invitation as Record<string, unknown>));
});

// GET /invitations - return all invitations
router.get('/invitations', (req, res) => {
  try {
    const invitations = getAllInvitations.all() as unknown[];
    res.json(invitations.map((r) => fromDbRow('Invitation', r as Record<string, unknown>)));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post('/invitations', (req, res) => {
  try {
  // Validate input
  const validation = CreateInvitationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.message });
  }
  
  const row = toDbRow('Invitation', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
  
  // Check for existing pending invitation with same inviter and email
  const existingInvitation = getInvitationByEmail.get(row.invitee_email, row.inviter_id) as Record<string, unknown>;
  if (existingInvitation) {
    // Check if the existing invitation has expired
    const expiresAt = new Date(existingInvitation.expires_at as string);
    const now = new Date();
    if (expiresAt > now) {
      // Existing invitation is still valid, reject duplicate
      throw new Error('A pending invitation already exists for this email');
    } else {
      // Existing invitation has expired, update its status to expired
      updateInvitationStatus.run('expired', null, existingInvitation.id as string);
    }
  }
  
  const values = ['id','inviter_id','invitee_email','message','token','expires_at'].map((k) => (k in row ? row[k] : null));
  insertInvitation.run(...values);
  res.status(201).json({ id: row.id });
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

export default router;
