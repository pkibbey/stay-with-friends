This project stores uploaded images under `public/uploads` and exposes them at `http://localhost:4000/uploads/<filename>`.

Endpoint

- POST /api/upload-image
  - Accepts multipart/form-data with a single file in the `image` field.
  - Returns JSON: { url: "http://localhost:4000/uploads/<filename>" }

Server-side behavior

- Files are saved to `apps/backend/public/uploads`.
- Multer is configured with a 5 MB size limit and basic mimetype checking (`image/*`).
- When a host is updated via `updateHost`, the server will attempt to delete any files that were removed from the host's `photos` array, but only if their URL includes `/uploads/` (to avoid removing external URLs).
- File deletion is best-effort and failures are logged without failing the mutation.

Production notes

- For multi-instance deployments or serverless environments use object storage (S3, GCS) and update the upload and deletion logic to call the provider's APIs.
- Add authentication/authorization to the upload endpoint to prevent abuse and ensure ownership validation when attaching photos to hosts.
- Consider image processing (resizing, re-encoding) with `sharp` to sanitize uploads and reduce storage/bandwidth.
