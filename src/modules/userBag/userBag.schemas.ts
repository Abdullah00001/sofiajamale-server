import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

export const CreateCollectionSchema = z.object({
  // MongoDB ObjectId references - using string validation
  brandId: z
    .string({
      error: 'Brand ID is required',
    })
    .refine((val) => isValidObjectId(val), {
      message: 'Invalid Brand ID format',
    }),

  modelId: z
    .string({
      error: 'Model ID is required',
    })
    .refine((val) => isValidObjectId(val), {
      message: 'Invalid Model ID format',
    }),

  // Bag properties
  bagColor: z
    .string({
      error: 'Bag color is required',
    })
    .min(1, {
      error: 'Bag color cannot be empty',
    }),

  latherType: z
    .string({
      error: 'Leather type is required',
    })
    .min(1, {
      error: 'Leather type cannot be empty',
    }),

  hardwareColor: z
    .string({
      error: 'Hardware color is required',
    })
    .min(1, {
      error: 'Hardware color cannot be empty',
    }),

  size: z
    .string({
      error: 'Size is required',
    })
    .min(1, {
      error: 'Size cannot be empty',
    }),

  // Production year - COERCED from string to number for form-data
  productionYear: z.coerce
    .number({
      error: 'Production year must be a number',
    })
    .int({
      error: 'Production year must be an integer',
    })
    .min(1900, {
      error: 'Production year must be 1900 or later',
    })
    .max(new Date().getFullYear() + 1, {
      error: `Production year cannot exceed ${new Date().getFullYear() + 1}`,
    }),

  // Condition of the bag
  condition: z
    .string({
      error: 'Condition is required',
    })
    .min(1, {
      error: 'Condition cannot be empty',
    }),

  // Purchase price - COERCED from string to number for form-data
  purchasePrice: z.coerce
    .number({
      error: 'Purchase price must be a number',
    })
    .min(0, {
      error: 'Purchase price cannot be negative',
    }),

  currency: z
    .string({
      error: 'Currency is required',
    })
    .min(1, {
      error: 'Currency cannot be empty',
    })
    .max(3, {
      error: 'Currency code should be 3 characters or less (e.g., USD, EUR)',
    }),

  purchaseLocation: z
    .string({
      error: 'Purchase location is required',
    })
    .min(1, {
      error: 'Purchase location cannot be empty',
    }),

  // Purchase date - accepts dd/mm/yy format and converts to Date
  purchaseDate: z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
      'Purchase date must be in dd/mm/yy format (e.g., 12/11/25)'
    )
    .transform((val) => {
      // Parse dd/mm/yy to Date object
      const [day, month, year] = val.split('/');
      // Assuming yy is 20yy (2000s)
      const fullYear = `20${year}`;
      return new Date(`${fullYear}-${month}-${day}`);
    }),

  purchaseType: z
    .string({
      error: 'Purchase type is required',
    })
    .min(1, {
      error: 'Purchase type cannot be empty',
    }),

  // Optional fields - also coerced if provided
  waitingTimeInDays: z.coerce
    .number({
      error: 'Waiting time must be a number',
    })
    .int({
      error: 'Waiting time must be an integer',
    })
    .min(0, {
      error: 'Waiting time cannot be negative',
    })
    .optional(),

  notes: z.string().optional(),
});

export type TCreateUserCollection = z.infer<typeof CreateCollectionSchema>;

export const baseUpdateSchema = z.object({
  // Bag properties
  bagColor: z
    .string({
      error: 'Bag color must be a string',
    })
    .min(1, {
      error: 'Bag color cannot be empty',
    }),

  latherType: z
    .string({
      error: 'Leather type must be a string',
    })
    .min(1, {
      error: 'Leather type cannot be empty',
    }),

  hardwareColor: z
    .string({
      error: 'Hardware color must be a string',
    })
    .min(1, {
      error: 'Hardware color cannot be empty',
    }),

  size: z
    .string({
      error: 'Size must be a string',
    })
    .min(1, {
      error: 'Size cannot be empty',
    }),

  // Price status - assuming it's an enum/string
  priceStatus: z
    .string({
      error: 'Price status must be a string',
    })
    .min(1, {
      error: 'Price status cannot be empty',
    }),

  // Production year - with coercion for form-data
  productionYear: z.coerce
    .number({
      error: 'Production year must be a number',
    })
    .int({
      error: 'Production year must be an integer',
    })
    .min(1900, {
      error: 'Production year must be 1900 or later',
    })
    .max(new Date().getFullYear() + 1, {
      error: `Production year cannot exceed ${new Date().getFullYear() + 1}`,
    }),

  // Condition
  condition: z
    .string({
      error: 'Condition must be a string',
    })
    .min(1, {
      error: 'Condition cannot be empty',
    }),

  // Purchase price - with coercion for form-data
  purchasePrice: z.coerce
    .number({
      error: 'Purchase price must be a number',
    })
    .min(0, {
      error: 'Purchase price cannot be negative',
    }),

  // Currency
  currency: z
    .string({
      error: 'Currency must be a string',
    })
    .min(1, {
      error: 'Currency cannot be empty',
    })
    .max(3, {
      error: 'Currency code should be 3 characters or less (e.g., USD, EUR)',
    }),

  // Purchase location
  purchaseLocation: z
    .string({
      error: 'Purchase location must be a string',
    })
    .min(1, {
      error: 'Purchase location cannot be empty',
    }),

  // Purchase date - accepts dd/mm/yy format
  purchaseDate: z
    .string()
    .regex(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/,
      'Purchase date must be in dd/mm/yy format (e.g., 12/11/25)'
    )
    .transform((val) => {
      const [day, month, year] = val.split('/');
      const fullYear = `20${year}`;
      return new Date(`${fullYear}-${month}-${day}`);
    }),

  // Purchase type
  purchaseType: z
    .string({
      error: 'Purchase type must be a string',
    })
    .min(1, {
      error: 'Purchase type cannot be empty',
    }),

  // Archived status - with coercion for form-data
  isArchived: z.coerce.boolean({
    error: 'isArchived must be a boolean',
  }),

  // Optional fields (can be null or undefined)
  waitingTimeInDays: z
    .union([z.coerce.number().int().min(0), z.null()])
    .optional(),

  notes: z.union([z.string(), z.null()]).optional(),
});

export const PatchCollectionSchema = baseUpdateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type TPatchUserCollection = z.infer<typeof PatchCollectionSchema>;