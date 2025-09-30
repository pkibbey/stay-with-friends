import { test, expect } from '@playwright/test';
import { Invitation } from '@stay-with-friends/shared-types';

test('invite accept flow', async ({ page, request, baseURL }) => {
  const runId = Date.now().toString().slice(-6);
  const inviterEmail = `e2e-inviter-${runId}@example.com`;
  const inviteeEmail = `e2e-invitee-${runId}@example.com`;

  // Create an inviter user via backend REST API (idempotent)
  let inviterId: string;
  const createUserRes = await request.post('http://localhost:4000/api/users', {
    data: { email: inviterEmail, name: 'E2E Inviter' }
  });
  if (createUserRes.status() === 409) {
    // User already exists, fetch user
    const userQueryRes = await request.get(`http://localhost:4000/api/users?email=${encodeURIComponent(inviterEmail)}`);
    const userJson = await userQueryRes.json();
    expect(userJson?.id).toBeDefined();
    inviterId = userJson.id;
  } else {
    const userJson = await createUserRes.json();
    expect(userJson?.id).toBeDefined();
    inviterId = userJson.id;
  }

  // Create invitation (idempotent)
  const inviteRes = await request.post('http://localhost:4000/api/invitations', {
    data: { inviterId, inviteeEmail, message: 'Please join' }
  });
  let token: string;
  if (inviteRes.status() === 409) {
    // Invitation already exists, fetch pending invitation
    const invsRes = await request.get(`http://localhost:4000/api/invitations?inviterId=${encodeURIComponent(inviterId)}`);
    const invsJson = await invsRes.json();
    const pending = invsJson.find((i: Invitation) => i.invitee_email === inviteeEmail && i.status === 'pending');
    expect(pending).toBeDefined();
    token = pending.token;
  } else {
    const inviteJson = await inviteRes.json();
    expect(inviteJson?.token).toBeDefined();
    token = inviteJson.token;
  }

  // Navigate to frontend invite accept page
  const inviteUrl = `${baseURL}/invite/${token}`;
  await page.goto(inviteUrl);

  // Accept invitation via REST
  const acceptRes = await request.post('http://localhost:4000/api/invitations/accept', {
    data: { token, name: 'E2E Invitee' }
  });
  const acceptJson = await acceptRes.json();
  expect(acceptJson?.id).toBeDefined();

  // Verify backend state: invitation should be marked accepted and user should exist
  const invQueryRes = await request.get(`http://localhost:4000/api/invitations/${encodeURIComponent(token)}`);
  const invQueryJson = await invQueryRes.json();
  expect(invQueryJson?.status).toBe('accepted');

  const userQueryRes = await request.get(`http://localhost:4000/api/users?email=${encodeURIComponent(inviteeEmail)}`);
  const userQueryJson = await userQueryRes.json();
  expect(userQueryJson?.id).toBeDefined();
});
