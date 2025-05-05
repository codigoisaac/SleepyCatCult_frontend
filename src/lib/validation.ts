import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const movieSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  originalTitle: z.string().optional(),
  releaseDate: z.string().min(1, { message: "Release date is required" }),
  overview: z.string().min(1, { message: "Overview is required" }),
  budget: z.union([z.number().positive(), z.null()]).optional(),
  runtime: z.union([z.number().positive(), z.null()]).optional(),
  score: z.union([z.number().min(0).max(10), z.null()]).optional(),
  poster: z.instanceof(File).optional(),
});

export const filterSchema = z.object({
  minRuntime: z.union([z.number().positive(), z.null()]).optional(),
  maxRuntime: z.union([z.number().positive(), z.null()]).optional(),
  minReleaseDate: z.string().optional(),
  maxReleaseDate: z.string().optional(),
  minScore: z.union([z.number().min(0).max(10), z.null()]).optional(),
  maxScore: z.union([z.number().min(0).max(10), z.null()]).optional(),
});
