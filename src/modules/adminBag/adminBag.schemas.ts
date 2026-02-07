import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

// Custom ObjectId validator
const objectIdSchema = z.string().refine((val) => isValidObjectId(val), {
  message: 'Invalid ObjectId format',
});

// Create schema
export const CreateAdminBagSchema = z.object({
  bagBrand: objectIdSchema,
  bagModel: objectIdSchema,
});
