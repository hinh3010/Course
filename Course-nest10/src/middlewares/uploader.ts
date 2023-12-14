import multer, { type StorageEngine } from 'multer';
import * as path from 'path';
import { toSlug } from 'src/libs/toSlug';

const LIMIT = 10; // 10MB

export const genFileName = (originalname: string): string => {
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const { name, ext } = path.parse(originalname);
  const slug = toSlug(name);
  const fileName = `${slug}_${uniqueSuffix + ext}`;
  return fileName;
};

/**
 * The Disk Storage engine used by Multer to upload files to disk.
 */
const diskStorage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'src/uploads');
  },
  filename: (_req, file, cb) => {
    const fileName = genFileName(file.originalname);
    cb(null, fileName);
  },
});

/**
 * The Memory Storage engine used by Multer to upload files to memory.
 */
const memoryStorage: StorageEngine = multer.memoryStorage();

interface CustomUploadOptions {
  limit?: number;
  type?: 'single' | 'array';
  storage?: 'disk' | 'memory';
  maxCount?: number;
}

export function uploader(key: string, options: CustomUploadOptions = {}) {
  const { storage = 'memory', limit = LIMIT, type = 'single', maxCount = 5 } = options;

  let uploadMiddleware;
  let storageEngine: StorageEngine;

  if (storage === 'disk') storageEngine = diskStorage;
  else storageEngine = memoryStorage;

  if (type === 'array') {
    uploadMiddleware = multer({
      storage: storageEngine,
      limits: { fileSize: limit * 1024 * 1024 },
    }).array(key, maxCount);
  } else {
    uploadMiddleware = multer({
      storage: storageEngine,
      limits: { fileSize: limit * 1024 * 1024 },
    }).single(key);
  }

  return uploadMiddleware;
}

export default uploader;
