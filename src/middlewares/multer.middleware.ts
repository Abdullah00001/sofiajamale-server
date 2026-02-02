import path from 'path';

import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    cb(null, './public/temp');
  },
  filename: (_req: Request, file, cb) => {
    const name = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    cb(null, name + '-' + Date.now() + '-' + ext);
  },
});

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/webp' ||
    file.mimetype === 'image/svg+xml'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only .jpeg and .png and .webp and .svg files are allowed!'
      ) as any,
      false
    );
  }
};

export const docsUpload = multer({
  storage: storage,
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFileFilter,
});

export default upload;
