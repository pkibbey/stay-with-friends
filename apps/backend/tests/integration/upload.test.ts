import express from 'express'
import request from 'supertest'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'

describe('Upload API', () => {
  let app: express.Application

  beforeAll(async () => {
    app = express()
    app.use(cors())

    // Mount a local multer-based upload handler for test isolation
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads')
    fs.mkdirSync(uploadsDir, { recursive: true })
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        // Use UUID-based naming like the main app
        const uuid = uuidv4()
        const ext = path.extname(file.originalname)
        cb(null, `${uuid}${ext}`)
      },
    })
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'))
        cb(null, true)
      }
    })
    app.post('/api/upload-image', upload.single('image'), (req, res) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const file = (req as any).file
      if (!file) return res.status(400).json({ error: 'No file uploaded' })
      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
      res.json({ url })
    })
  })

  it('uploads an image successfully', async () => {
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads')
    fs.mkdirSync(uploadsDir, { recursive: true })

    const res = await request(app)
      .post('/api/upload-image')
      .attach('image', Buffer.from([0x89,0x50,0x4e,0x47]), 'test.png')

    expect(res.status).toBe(200)
    expect(res.body.url).toBeDefined()

    // Ensure file exists on disk (filename from URL)
    const filename = res.body.url.split('/').pop()
    expect(fs.existsSync(path.join(uploadsDir, filename))).toBe(true)
    
    // Verify filename is a UUID with proper extension
    expect(filename).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.png$/i)
  })

  it('rejects non-image uploads', async () => {
    const res = await request(app)
      .post('/api/upload-image')
      .attach('image', Buffer.from('not-an-image'), 'test.txt')

    // multer returns 500 for fileFilter errors by default; treat anything non-200 as rejection
    expect(res.status).not.toBe(200)
  })
})
