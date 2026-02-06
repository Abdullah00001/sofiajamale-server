import { z } from 'zod';

export const CreateBlogSchema = z.object({
  blogTitle: z
    .string({
      message: 'Blog title is required and must be a string',
    })
    .min(10, {
      message: 'Blog title must be at least 10 characters long',
    })
    .max(200, {
      message: 'Blog title must not exceed 200 characters',
    })
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Blog title cannot be empty or just whitespace',
    })
    .refine((val) => !/^\s|\s$/.test(val), {
      message: 'Blog title cannot start or end with whitespace',
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: 'Blog title cannot contain consecutive spaces',
    })
    .refine((val) => /^[a-zA-Z0-9\s\-:,.'!?&]+$/.test(val), {
      message: 'Blog title contains invalid characters',
    }),

  blogDescription: z
    .string({
      message: 'Blog description is required and must be a string',
    })
    .min(100, {
      message: 'Blog description must be at least 100 characters long',
    })
    .max(5000, {
      message: 'Blog description must not exceed 5000 characters',
    })
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Blog description cannot be empty or just whitespace',
    })
    .refine(
      (val) => {
        const wordCount = val.trim().split(/\s+/).length;
        return wordCount >= 20;
      },
      {
        message: 'Blog description must contain at least 20 words',
      }
    )
    .refine(
      (val) => {
        const sentences = val
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0);
        return sentences.length >= 2;
      },
      {
        message: 'Blog description must contain at least 2 sentences',
      }
    )
    .refine((val) => !/(.)\1{5,}/.test(val), {
      message: 'Blog description contains too many repeated characters',
    })
    .refine(
      (val) => {
        const specialCharCount = (val.match(/[^a-zA-Z0-9\s]/g) || []).length;
        const totalLength = val.length;
        return specialCharCount / totalLength < 0.2;
      },
      {
        message: 'Blog description contains too many special characters',
      }
    ),
});

export const UpdateBlogSchema = z.object({
  blogTitle: z
    .string({
      message: 'Blog title must be a string',
    })
    .min(10, {
      message: 'Blog title must be at least 10 characters long',
    })
    .max(200, {
      message: 'Blog title must not exceed 200 characters',
    })
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Blog title cannot be empty or just whitespace',
    })
    .refine((val) => !/^\s|\s$/.test(val), {
      message: 'Blog title cannot start or end with whitespace',
    })
    .refine((val) => !/\s{2,}/.test(val), {
      message: 'Blog title cannot contain consecutive spaces',
    })
    .refine((val) => /^[a-zA-Z0-9\s\-:,.'!?&]+$/.test(val), {
      message: 'Blog title contains invalid characters',
    })
    .optional(),

  blogDescription: z
    .string({
      message: 'Blog description must be a string',
    })
    .min(100, {
      message: 'Blog description must be at least 100 characters long',
    })
    .max(5000, {
      message: 'Blog description must not exceed 5000 characters',
    })
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Blog description cannot be empty or just whitespace',
    })
    .refine(
      (val) => {
        const wordCount = val.trim().split(/\s+/).length;
        return wordCount >= 20;
      },
      {
        message: 'Blog description must contain at least 20 words',
      }
    )
    .refine(
      (val) => {
        const sentences = val
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0);
        return sentences.length >= 2;
      },
      {
        message: 'Blog description must contain at least 2 sentences',
      }
    )
    .refine((val) => !/(.)\1{5,}/.test(val), {
      message: 'Blog description contains too many repeated characters',
    })
    .refine(
      (val) => {
        const specialCharCount = (val.match(/[^a-zA-Z0-9\s]/g) || []).length;
        const totalLength = val.length;
        return specialCharCount / totalLength < 0.2;
      },
      {
        message: 'Blog description contains too many special characters',
      }
    )
    .optional(),
});
