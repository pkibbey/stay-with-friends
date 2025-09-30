import express from 'express';
import { getUserByEmail, getUserById, insertUser, updateUser } from '../db';
import { validateEmail, validateName, toDbRow, fromDbRow } from '@stay-with-friends/shared-types';
import crypto from 'crypto';

const router = express.Router();

router.get('/users/email/:email', (req, res) => {
  const user = getUserByEmail.get(req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(fromDbRow('User', user as Record<string, unknown>));
});

router.post('/users', (req, res) => {
  try {
    validateEmail(req.body.email);
    validateName(req.body.name);
  const row = toDbRow('User', req.body as Record<string, unknown>);
  if (!row.id) row.id = crypto.randomUUID();
    const values = ['id','email','name','email_verified','image'].map((k) => (k in row ? row[k] : null));
    insertUser.run(...values);
  res.status(201).json({ id: row.id });
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

export default router;
