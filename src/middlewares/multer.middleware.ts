import path from 'path';

import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';

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

// Base upload configuration
const baseUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // Global max limit
  fileFilter: imageFileFilter,
});

// ============================================================================
// UPLOAD FIELDS MIDDLEWARE
// ============================================================================
export interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

export interface FieldConfig {
  name: string;
  maxCount: number;
  optional?: boolean;
}
/**
 * Reusable middleware for multiple file fields in ONE request
 * Use this for handling multiple image fields (thumbnail, coverImages, galleryImages, etc.)
 * @param fieldsConfig - Array of {name, maxCount, optional} configurations
 * @param requireAtLeastOne - If true, at least one file must be uploaded across all fields
 * @example
 * // All fields optional
 * const productFields = [
 *   { name: 'thumbnail', maxCount: 1, optional: true },
 *   { name: 'coverImages', maxCount: 5, optional: true },
 *   { name: 'galleryImages', maxCount: 10, optional: true }
 * ];
 * router.put('/products/:id', uploadFields(productFields), handleMulterError, controller);
 *
 * @example
 * // At least one file required
 * const productFields = [
 *   { name: 'thumbnail', maxCount: 1, optional: true },
 *   { name: 'receiptImage', maxCount: 1, optional: true }
 * ];
 * router.post('/products', uploadFields(productFields, true), handleMulterError, controller);
 */

export const uploadFields = (
  fieldsConfig: FieldConfig[],
  requireAtLeastOne: boolean = false // NEW: Option to require at least one file
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store config for error handler
    req.fieldConfig = fieldsConfig;
    req.requireAtLeastOne = requireAtLeastOne;

    const multerFields = fieldsConfig.map((field) => ({
      name: field.name,
      maxCount: field.maxCount,
    }));

    baseUpload.fields(multerFields)(req, res, (err: any) => {
      if (err) {
        return next(err);
      }

      // Validation: Check if at least one file is required
      if (requireAtLeastOne) {
        const files = req.files as MulterFiles;
        const hasAnyFile = files && Object.keys(files).length > 0;

        if (!hasAnyFile) {
          return res.status(400).json({
            success: false,
            status: 400,
            message: 'At least one file must be uploaded.',
          });
        }
      }

      next();
    });
  };
};

// Wrapper to set the limit in the request
export const uploadArray = (fieldName: string, maxCount: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.fileLimit = maxCount; // Store the route-specific limit
    req.fieldName = fieldName; // Store the field name
    baseUpload.array(fieldName, maxCount)(req, res, next);
  };
};

// Wrapper for single file
export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.fileLimit = 1;
    req.fieldName = fieldName;
    baseUpload.single(fieldName)(req, res, next);
  };
};

// Multer error handler middleware - reads from req.fileLimit
export const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof MulterError) {
    const fileLimit = req.fileLimit || 10; // Use route limit or default to 10
    const fieldName = req.fieldName || 'file';

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        status: 400,
        message: 'File size too large. Maximum allowed size is 5MB per file.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        status: 400,
        message: `Too many files. Maximum allowed is ${fileLimit} files.`,
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      const allowedFields =
        req.fieldConfig?.map((f) => f.name).join(', ') || fieldName;
      return res.status(400).json({
        success: false,
        status: 400,
        message: `Unexpected field '${err.field}'. Expected fields: ${allowedFields}.`,
      });
    }
    return res.status(400).json({
      success: false,
      status: 400,
      message: err.message || 'File upload error.',
    });
  }

  if (err && err.message && err.message.includes('Only .jpeg')) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: err.message,
    });
  }

  next(err);
};
