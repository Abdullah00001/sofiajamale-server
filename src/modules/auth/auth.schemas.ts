import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required')
      .min(4, 'Name must be at least 4 characters long'),

    email: z
      .string()
      .min(1, 'Email is required')
      .pipe(z.email('Please provide a valid email address')),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters long'),

    isTermsAndPrivacyAccepted: z
      .boolean()
      .refine(Boolean, 'You must accept the terms and privacy policy'),

    termsAndPrivacyAcceptedAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isTermsAndPrivacyAccepted && !data.termsAndPrivacyAcceptedAt) {
      ctx.addIssue({
        path: ['termsAndPrivacyAcceptedAt'],
        code: 'custom',
        message:
          'Acceptance date is required when terms and privacy are accepted',
      });
    }
  });

export const verifyOtpSchema = z
  .object({
    otp: z
      .string()
      .trim() // Remove accidental whitespace
      .length(6, 'OTP must be exactly 6 digits') // More precise than min(6).max(6)
      .regex(/^\d+$/, 'OTP must only contain numbers'), // Prevent letters/special chars
  })
  .strict(); // Disallow extra fields in the request object

export type TSignupPayload = z.infer<typeof signupSchema>;
