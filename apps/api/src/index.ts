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

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
