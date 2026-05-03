import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { prisma } from "./prisma";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // health check
  app.get("/health", async () => ({ ok: true }));

  // 1) Öğrenci numarası -> ad soyad doğrulama
  app.post("/api/student/lookup", async (req, reply) => {
    const body = z
      .object({
        joinCode: z.string().min(4),
        studentNo: z.string().min(1),
      })
      .parse(req.body);

    const joinCode = body.joinCode.trim().toUpperCase();

    const assignment = await prisma.assignment.findUnique({
      where: { joinCode },
      select: { id: true, classId: true },
    });

    if (!assignment) {
      return reply.code(404).send({ ok: false, error: "ASSIGNMENT_NOT_FOUND" });
    }

    const student = await prisma.student.findUnique({
      where: {
        classId_studentNo: {
          classId: assignment.classId,
          studentNo: body.studentNo.trim(),
        },
      },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!student) {
      return reply.code(404).send({ ok: false, error: "NOT_FOUND" });
    }

    return {
      ok: true,
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
    };
  });

  // 2) Attempt başlat (tek katılım)
  app.post("/api/attempt/start", async (req, reply) => {
    const body = z
      .object({
        joinCode: z.string().min(4),
        studentId: z.string().min(1),
      })
      .parse(req.body);

    const joinCode = body.joinCode.trim().toUpperCase();

    const assignment = await prisma.assignment.findUnique({
      where: { joinCode },
      select: { id: true },
    });

    if (!assignment) {
      return reply.code(404).send({ ok: false, error: "ASSIGNMENT_NOT_FOUND" });
    }

    try {
      const attempt = await prisma.attempt.create({
        data: { assignmentId: assignment.id, studentId: body.studentId },
        select: { id: true },
      });
      return { ok: true, attemptId: attempt.id };
    } catch {
      const existing = await prisma.attempt.findFirst({
        where: { assignmentId: assignment.id, studentId: body.studentId },
        select: { id: true, status: true, totalScore: true },
      });
      return reply.code(200).send({
        ok: true,
        attemptId: existing?.id,
        alreadyStarted: true,
        status: existing?.status,
        totalScore: existing?.totalScore,
      });
    }
  });

  // 3) Attempt -> quiz + sorular (şimdilik hepsini veriyoruz)
  app.get("/api/attempt/:attemptId/quiz", async (req, reply) => {
    const params = z.object({ attemptId: z.string().min(1) }).parse(req.params);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      select: {
        id: true,
        status: true,
        assignment: {
          select: {
            quiz: {
              select: {
                id: true,
                title: true,
                questions: {
                  orderBy: { order: "asc" },
                  select: {
                    order: true,
                    question: {
                      select: {
                        id: true,
                        text: true,
                        imageUrl: true,
                        a: true,
                        b: true,
                        c: true,
                        d: true,
                        timeLimitSec: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt)
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });

    return { ok: true, attempt };
  });

  // 4) Soru cevaplama (Answer)
  app.post("/api/attempt/:attemptId/answer", async (req, reply) => {
    const params = z.object({ attemptId: z.string().min(1) }).parse(req.params);
    const body = z
      .object({
        questionId: z.string().min(1),
        selected: z.enum(["A", "B", "C", "D"]),
        timeMs: z.number().nonnegative(),
      })
      .parse(req.body);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
    });

    if (!attempt) return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    if (attempt.status !== "STARTED") return reply.code(400).send({ ok: false, error: "ATTEMPT_ALREADY_FINISHED" });

    // Soru daha önce cevaplanmış mı?
    const existingAnswer = await prisma.answer.findFirst({
      where: { attemptId: attempt.id, questionId: body.questionId },
    });
    if (existingAnswer) return reply.code(400).send({ ok: false, error: "QUESTION_ALREADY_ANSWERED" });

    // Soru bilgilerini al (doğru cevap ve süre)
    const question = await prisma.question.findUnique({ where: { id: body.questionId } });
    if (!question) return reply.code(404).send({ ok: false, error: "QUESTION_NOT_FOUND" });

    // Puan hesaplama (Zaman bazlı)
    // Maksimum puan: 1000
    // Zaman geçtikçe puan düşer, ama doğruysa en az %30 unu alır (300 puan). Yanlışsa 0.
    let scoreAwarded = 0;
    const isCorrect = question.correct === body.selected;

    if (isCorrect) {
      const maxTimeMs = question.timeLimitSec * 1000;
      const timeRatio = Math.max(0, Math.min(1, body.timeMs / maxTimeMs));
      scoreAwarded = Math.round(1000 * (1 - (timeRatio * 0.7))); // Max 1000, Min 300
    }

    await prisma.answer.create({
      data: {
        attemptId: attempt.id,
        questionId: question.id,
        selected: body.selected,
        isCorrect,
        timeMs: body.timeMs,
        scoreAwarded,
      },
    });

    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { totalScore: { increment: scoreAwarded } },
    });

    return { ok: true, isCorrect, correctOption: question.correct, scoreAwarded };
  });

  // 5) Attempt bitirme (Finish)
  app.post("/api/attempt/:attemptId/finish", async (req, reply) => {
    const params = z.object({ attemptId: z.string().min(1) }).parse(req.params);

    const attempt = await prisma.attempt.findUnique({ where: { id: params.attemptId } });
    if (!attempt) return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    if (attempt.status === "FINISHED") return reply.code(400).send({ ok: false, error: "ALREADY_FINISHED" });

    const finishedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "FINISHED",
        finishedAt: new Date(),
      },
    });

    return { ok: true, totalScore: finishedAttempt.totalScore };
  });

  // 6) Liderlik Tablosu (Leaderboard)
  app.get("/api/assignment/:assignmentId/leaderboard", async (req, reply) => {
    const params = z.object({ assignmentId: z.string().min(1) }).parse(req.params);

    // Sadece FINISHED attemptleri de getirebiliriz ama canli liderlik de olabilir
    const attempts = await prisma.attempt.findMany({
      where: { assignmentId: params.assignmentId },
      orderBy: { totalScore: "desc" },
      take: 10,
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    const leaderboard = attempts.map((a) => ({
      attemptId: a.id,
      name: `${a.student.firstName} ${a.student.lastName.charAt(0)}.`,
      score: a.totalScore,
    }));

    return { ok: true, leaderboard };
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
