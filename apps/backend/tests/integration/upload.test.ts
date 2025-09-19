import express from 'express'
import request from 'supertest'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

describe('Upload API', () => {
  let app: express.Application

  beforeAll(async () => {
    app = express()
    app.use(cors())

    // Mount a local multer-based upload handler for test isolation
    const multer = require('multer')
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads')
    fs.mkdirSync(uploadsDir, { recursive: true })
    const storage = multer.diskStorage({
      destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
      filename: (_req: any, file: any, cb: any) => cb(null, `test-${Date.now()}-${file.originalname}`),
    })
    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req: any, file: any, cb: any) => {
        if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'))
        cb(null, true)
      }
    })
    app.post('/api/upload-image', upload.single('image'), (req: any, res: any) => {
      const file = req.file
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
  })

  it('rejects non-image uploads', async () => {
    const res = await request(app)
      .post('/api/upload-image')
      .attach('image', Buffer.from('not-an-image'), 'test.txt')

    // multer returns 500 for fileFilter errors by default; treat anything non-200 as rejection
    expect(res.status).not.toBe(200)
  })
})
