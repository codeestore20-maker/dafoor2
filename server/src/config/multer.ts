import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fixEncoding } from '../utils/encoding';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Fix encoding for Arabic filenames safely
        const originalName = fixEncoding(file.originalname);
        cb(null, uniqueSuffix + '-' + originalName);
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
