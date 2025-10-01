# For Later
Move photo storage to s3 bucket

Add Google login as well as magic link login, and do we want email password too? Can we enforce only good secure logins like magic link?

Add more test coverage

Make tests more complete

Add caching for homepage data only to improve performance - could this be done simply on the backend server?

Add a unique constraint (and backfill) for `connections (user_id, connected_user_id)` so the API matches test expectations