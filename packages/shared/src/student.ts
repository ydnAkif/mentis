import { z } from "zod";

export const lookupSchema = z.object({
  joinCode: z.string().min(4),
  studentNo: z.string().min(1),
});

export const startAttemptSchema = z.object({
  joinCode: z.string().min(4),
  studentId: z.string().min(1),
});

export const attemptParamsSchema = z.object({
  attemptId: z.string().min(1),
});

export const answerBodySchema = z.object({
  questionId: z.string().min(1),
  selected: z.enum(["A", "B", "C", "D"]),
  timeMs: z.number().nonnegative(),
});

export const assignmentParamsSchema = z.object({
  assignmentId: z.string().min(1),
});
