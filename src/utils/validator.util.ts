import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['jobseeker', 'recruiter'], {
    errorMap: () => ({ message: 'Role must be either jobseeker or recruiter' })
  }),
  company: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(1, 'Experience is required'),
  education: z.string().min(1, 'Education is required')
});