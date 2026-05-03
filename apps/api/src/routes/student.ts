import { FastifyPluginAsync } from "fastify";
import { prisma } from "../prisma";
import {
  lookupSchema,
  startAttemptSchema,
  attemptParamsSchema,
  answerBodySchema,
  assignmentParamsSchema,
} from "@mentis/shared";

export const studentRoutes: FastifyPluginAsync = async (app) => {
  // 1) Öğrenci numarası -> ad soyad doğrulama
  app.post("/student/lookup", async (req, reply) => {
    const body = lookupSchema.parse(req.body);
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
  app.post("/attempt/start", async (req, reply) => {
    const body = startAttemptSchema.parse(req.body);
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

  // 3) Attempt -> quiz + sorular
  app.get("/attempt/:attemptId/quiz", async (req, reply) => {
    const params = attemptParamsSchema.parse(req.params);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      select: {
        id: true,
        status: true,
        totalScore: true,
        answers: {
          select: {
            questionId: true,
            selected: true,
            isCorrect: true,
            scoreAwarded: true,
            timeMs: true,
          },
          orderBy: { createdAt: "asc" },
        },
        assignment: {
          select: {
            id: true,
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

    if (!attempt) {
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    }

    return { ok: true, attempt };
  });

  // 4) Attempt sonucu özeti
  app.get("/attempt/:attemptId/result", async (req, reply) => {
    const params = attemptParamsSchema.parse(req.params);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      select: {
        id: true,
        status: true,
        totalScore: true,
        startedAt: true,
        finishedAt: true,
        answers: {
          select: { isCorrect: true },
        },
        assignment: {
          select: {
            id: true,
            quiz: {
              select: {
                title: true,
                questions: {
                  select: { questionId: true },
                },
              },
            },
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attempt) {
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    }

    const answeredCount = attempt.answers.length;
    const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
    const totalQuestions = attempt.assignment.quiz.questions.length;

    return {
      ok: true,
      result: {
        attemptId: attempt.id,
        status: attempt.status,
        totalScore: attempt.totalScore,
        answeredCount,
        correctCount,
        totalQuestions,
        assignmentId: attempt.assignment.id,
        quizTitle: attempt.assignment.quiz.title,
        studentName: `${attempt.student.firstName} ${attempt.student.lastName}`,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
      },
    };
  });

  // 5) Attempt soru inceleme detayı
  app.get("/attempt/:attemptId/review", async (req, reply) => {
    const params = attemptParamsSchema.parse(req.params);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
      select: {
        id: true,
        status: true,
        totalScore: true,
        startedAt: true,
        finishedAt: true,
        answers: {
          select: {
            questionId: true,
            selected: true,
            isCorrect: true,
            scoreAwarded: true,
            timeMs: true,
          },
        },
        assignment: {
          select: {
            id: true,
            quiz: {
              select: {
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
                        correct: true,
                        timeLimitSec: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attempt) {
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    }

    const answersByQuestionId = new Map(
      attempt.answers.map((answer) => [answer.questionId, answer])
    );

    const questions = attempt.assignment.quiz.questions.map((item) => {
      const answer = answersByQuestionId.get(item.question.id);

      return {
        order: item.order,
        questionId: item.question.id,
        text: item.question.text,
        imageUrl: item.question.imageUrl,
        choices: {
          A: item.question.a,
          B: item.question.b,
          C: item.question.c,
          D: item.question.d,
        },
        correctOption: item.question.correct,
        selectedOption: answer?.selected ?? null,
        isCorrect: answer?.isCorrect ?? null,
        scoreAwarded: answer?.scoreAwarded ?? 0,
        timeMs: answer?.timeMs ?? null,
        timeLimitSec: item.question.timeLimitSec,
      };
    });

    return {
      ok: true,
      review: {
        attemptId: attempt.id,
        status: attempt.status,
        totalScore: attempt.totalScore,
        answeredCount: attempt.answers.length,
        totalQuestions: questions.length,
        assignmentId: attempt.assignment.id,
        quizTitle: attempt.assignment.quiz.title,
        studentName: `${attempt.student.firstName} ${attempt.student.lastName}`,
        startedAt: attempt.startedAt,
        finishedAt: attempt.finishedAt,
        questions,
      },
    };
  });

  // 6) Soru cevaplama (Answer)
  app.post("/attempt/:attemptId/answer", async (req, reply) => {
    const params = attemptParamsSchema.parse(req.params);
    const body = answerBodySchema.parse(req.body);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
    });

    if (!attempt) {
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    }

    if (attempt.status !== "STARTED") {
      return reply
        .code(400)
        .send({ ok: false, error: "ATTEMPT_ALREADY_FINISHED" });
    }

    const existingAnswer = await prisma.answer.findFirst({
      where: { attemptId: attempt.id, questionId: body.questionId },
    });

    if (existingAnswer) {
      return reply
        .code(400)
        .send({ ok: false, error: "QUESTION_ALREADY_ANSWERED" });
    }

    const question = await prisma.question.findUnique({
      where: { id: body.questionId },
    });

    if (!question) {
      return reply.code(404).send({ ok: false, error: "QUESTION_NOT_FOUND" });
    }

    let scoreAwarded = 0;
    const isCorrect = question.correct === body.selected;

    if (isCorrect) {
      const maxTimeMs = question.timeLimitSec * 1000;
      const timeRatio = Math.max(0, Math.min(1, body.timeMs / maxTimeMs));
      scoreAwarded = Math.round(1000 * (1 - timeRatio * 0.7));
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

    return {
      ok: true,
      isCorrect,
      correctOption: question.correct,
      scoreAwarded,
    };
  });

  // 7) Attempt bitirme (Finish)
  app.post("/attempt/:attemptId/finish", async (req, reply) => {
    const params = attemptParamsSchema.parse(req.params);

    const attempt = await prisma.attempt.findUnique({
      where: { id: params.attemptId },
    });

    if (!attempt) {
      return reply.code(404).send({ ok: false, error: "ATTEMPT_NOT_FOUND" });
    }

    if (attempt.status === "FINISHED") {
      return reply.code(400).send({ ok: false, error: "ALREADY_FINISHED" });
    }

    const finishedAttempt = await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "FINISHED",
        finishedAt: new Date(),
      },
    });

    return { ok: true, totalScore: finishedAttempt.totalScore };
  });

  // 8) Liderlik Tablosu (Leaderboard)
  app.get("/assignment/:assignmentId/leaderboard", async (req, reply) => {
    const params = assignmentParamsSchema.parse(req.params);

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.assignmentId },
      select: {
        id: true,
        quiz: { select: { title: true } },
      },
    });

    if (!assignment) {
      return reply.code(404).send({ ok: false, error: "ASSIGNMENT_NOT_FOUND" });
    }

    const attempts = await prisma.attempt.findMany({
      where: { assignmentId: params.assignmentId },
      orderBy: { totalScore: "desc" },
      take: 10,
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    const leaderboard = attempts.map((attempt, index) => ({
      rank: index + 1,
      attemptId: attempt.id,
      name: `${attempt.student.firstName} ${attempt.student.lastName.charAt(0)}.`,
      score: attempt.totalScore,
      status: attempt.status,
    }));

    return {
      ok: true,
      assignmentId: assignment.id,
      quizTitle: assignment.quiz.title,
      leaderboard,
    };
  });
};
