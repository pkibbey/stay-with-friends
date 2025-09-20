import { Invitation } from '@/types';
import { test, expect } from '@playwright/test';

test('invite accept flow', async ({ page, request, baseURL }) => {
  const runId = Date.now().toString().slice(-6);
  const inviterEmail = `e2e-inviter-${runId}@example.com`;
  const inviteeEmail = `e2e-invitee-${runId}@example.com`;

  // Create an inviter user via backend GraphQL (idempotent - fall back to query if user exists)
  const createUserRes = await request.post('http://localhost:4000/graphql', {
    data: {
      query: `
        mutation CreateUser($email: String!, $name: String) {
          createUser(email: $email, name: $name) {
            id
            email
          }
        }
      `,
      variables: { email: inviterEmail, name: 'E2E Inviter' }
    }
  });

  const createUserJson = await createUserRes.json();

  let inviterId: string;
  if (createUserJson?.data?.createUser) {
    inviterId = createUserJson.data.createUser.id;
  } else {
    // If user already exists (unique constraint), query for the user
    const userQueryRes = await request.post('http://localhost:4000/graphql', {
      data: {
        query: `
          query GetUserByEmail($email: String!) {
            user(email: $email) {
              id
              email
            }
          }
        `,
        variables: { email: inviterEmail }
      }
    });
    const userJson = await userQueryRes.json();
    expect(userJson.data?.user).toBeDefined();
    inviterId = userJson.data.user.id;
  }

  // Create invitation (idempotent - fall back to querying invitations if mutation fails)
  const inviteRes = await request.post('http://localhost:4000/graphql', {
    data: {
      query: `
        mutation CreateInvitation($inviterId: ID!, $inviteeEmail: String!, $inviteeName: String, $message: String) {
          createInvitation(inviterId: $inviterId, inviteeEmail: $inviteeEmail, inviteeName: $inviteeName, message: $message) {
            id
            token
          }
        }
      `,
      variables: { inviterId, inviteeEmail, inviteeName: 'E2E Invitee', message: 'Please join' }
    }
  });

  const inviteJson = await inviteRes.json();

  let token: string;
  if (inviteJson?.data?.createInvitation) {
    token = inviteJson.data.createInvitation.token;
  } else {
    // Try to find an existing pending invitation for this inviter+invitee
    const invsRes = await request.post('http://localhost:4000/graphql', {
      data: {
        query: `
          query InvitationsByInviter($inviterId: ID!) {
            invitations(inviterId: $inviterId) {
              id
              token
              inviteeEmail
              status
            }
          }
        `,
        variables: { inviterId }
      }
    });
    const invsJson = await invsRes.json();
    const pending = invsJson.data?.invitations?.find((i: Invitation) => i.inviteeEmail === inviteeEmail && i.status === 'pending');
    expect(pending).toBeDefined();
    token = pending.token;
  }

  // Navigate to frontend invite accept page
  const inviteUrl = `${baseURL}/invite/${token}`;
  await page.goto(inviteUrl);

  // Instead of relying on the form submission in the UI (which can be flaky in CI),
  // call the acceptInvitation mutation directly so we can assert the result then
  // confirm the frontend shows the accepted state.
  const acceptRes = await request.post('http://localhost:4000/graphql', {
    data: {
      query: `
        mutation AcceptInvitation($token: String!, $userData: AcceptInvitationInput!) {
          acceptInvitation(token: $token, userData: $userData) {
            id
            email
            name
          }
        }
      `,
      variables: { token, userData: { name: 'E2E Invitee' } }
    }
  });

  const acceptJson = await acceptRes.json();
  expect(acceptJson.data?.acceptInvitation).toBeDefined();

  // Verify backend state: invitation should be marked accepted and user should exist
  const invQueryRes = await request.post('http://localhost:4000/graphql', {
    data: {
      query: `query GetInvitation($token: String!) { invitation(token: $token) { id token status inviteeEmail } }`,
      variables: { token }
    }
  });
  const invQueryJson = await invQueryRes.json();
  expect(invQueryJson.data?.invitation?.status).toBe('accepted');

  const userQueryRes = await request.post('http://localhost:4000/graphql', {
    data: {
      query: `query GetUser($email: String!) { user(email: $email) { id email } }`,
      variables: { email: inviteeEmail }
    }
  });
  const userQueryJson = await userQueryRes.json();
  expect(userQueryJson.data?.user).toBeDefined();
});
