import { z } from "zod";

export const registerTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginTeacherSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createClassSchema = z.object({
  name: z.string().min(1),
});

export const createStudentSchema = z.object({
  studentNo: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const createQuizSchema = z.object({
  title: z.string().min(1),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1),
  imageUrl: z.string().optional(),
  a: z.string().min(1),
  b: z.string().min(1),
  c: z.string().min(1),
  d: z.string().min(1),
  correct: z.enum(["A", "B", "C", "D"]),
  timeLimitSec: z.number().int().min(5).max(300),
});

export const assignQuizSchema = z.object({
  quizId: z.string().min(1),
  classId: z.string().min(1),
});
