import { FastifyPluginAsync } from "fastify";
import { prisma } from "../prisma";
import {
  registerTeacherSchema,
  loginTeacherSchema,
  createClassSchema,
  createStudentSchema,
  createQuizSchema,
  createQuestionSchema,
  assignQuizSchema,
} from "@mentis/shared";
import { z } from "zod";

export const teacherRoutes: FastifyPluginAsync = async (app) => {
  // 1) Auth: Kayıt Ol
  app.post("/teacher/register", async (req, reply) => {
    const body = registerTeacherSchema.parse(req.body);

    const existing = await prisma.teacher.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      return reply.code(400).send({ ok: false, error: "EMAIL_EXISTS" });
    }

    const teacher = await prisma.teacher.create({
      data: {
        email: body.email,
        password: body.password, // TODO: Hash password with bcrypt in a real app
      },
    });

    const token = app.jwt.sign({ id: teacher.id, email: teacher.email });
    return { ok: true, token, teacher: { id: teacher.id, email: teacher.email } };
  });

  // 2) Auth: Giriş Yap
  app.post("/teacher/login", async (req, reply) => {
    const body = loginTeacherSchema.parse(req.body);

    const teacher = await prisma.teacher.findUnique({
      where: { email: body.email },
    });

    if (!teacher || teacher.password !== body.password) {
      return reply.code(401).send({ ok: false, error: "INVALID_CREDENTIALS" });
    }

    const token = app.jwt.sign({ id: teacher.id, email: teacher.email });
    return { ok: true, token, teacher: { id: teacher.id, email: teacher.email } };
  });

  // Middleware for checking JWT
  const verifyJwt = async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.code(401).send({ ok: false, error: "UNAUTHORIZED" });
    }
  };

  // 3) Sınıflar (Classes) - Create
  app.post("/teacher/classes", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const body = createClassSchema.parse(req.body);
    const teacherId = req.user.id;

    const newClass = await prisma.class.create({
      data: {
        name: body.name,
        teacherId,
      },
    });

    return { ok: true, class: newClass };
  });

  // 4) Sınıflar - List
  app.get("/teacher/classes", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const teacherId = req.user.id;
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: { students: true, assignments: true }
        }
      }
    });

    return { ok: true, classes };
  });

  // 5) Öğrenciler (Students) - Create (Sınıfa öğrenci ekleme)
  app.post("/teacher/classes/:classId/students", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const { classId } = z.object({ classId: z.string().min(1) }).parse(req.params);
    const body = createStudentSchema.parse(req.body);

    // Verify class belongs to teacher
    const classExists = await prisma.class.findFirst({
      where: { id: classId, teacherId: req.user.id },
    });

    if (!classExists) {
      return reply.code(404).send({ ok: false, error: "CLASS_NOT_FOUND" });
    }

    const student = await prisma.student.create({
      data: {
        studentNo: body.studentNo,
        firstName: body.firstName,
        lastName: body.lastName,
        classId,
      },
    });

    return { ok: true, student };
  });

  // 6) Quiz Yönetimi - Create
  app.post("/teacher/quizzes", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const body = createQuizSchema.parse(req.body);

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
      },
    });

    return { ok: true, quiz };
  });

  // 7) Quiz Yönetimi - Soru Ekleme
  app.post("/teacher/quizzes/:quizId/questions", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const { quizId } = z.object({ quizId: z.string().min(1) }).parse(req.params);
    const body = createQuestionSchema.parse(req.body);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      }
    });

    if (!quiz) {
      return reply.code(404).send({ ok: false, error: "QUIZ_NOT_FOUND" });
    }

    const question = await prisma.question.create({
      data: {
        text: body.text,
        imageUrl: body.imageUrl,
        a: body.a,
        b: body.b,
        c: body.c,
        d: body.d,
        correct: body.correct,
        timeLimitSec: body.timeLimitSec,
      },
    });

    // Link question to quiz
    const order = quiz.questions.length + 1;
    await prisma.quizQuestion.create({
      data: {
        quizId,
        questionId: question.id,
        order,
      },
    });

    return { ok: true, question };
  });

  // 8) Atama (Assignment) Oluşturma
  app.post("/teacher/assignments", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const body = assignQuizSchema.parse(req.body);

    // Verify class
    const classExists = await prisma.class.findFirst({
      where: { id: body.classId, teacherId: req.user.id },
    });

    if (!classExists) {
      return reply.code(404).send({ ok: false, error: "CLASS_NOT_FOUND" });
    }

    // Create unique join code (e.g. 6 random uppercase chars)
    const generateJoinCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let joinCode = generateJoinCode();
    // In a real app we would ensure it's unique but this is fine for now

    const assignment = await prisma.assignment.create({
      data: {
        quizId: body.quizId,
        classId: body.classId,
        joinCode,
        startsAt: new Date(),
      },
    });

    return { ok: true, assignment };
  });
  
  // 9) Atama Listesi
  app.get("/teacher/assignments", { preValidation: [verifyJwt] }, async (req: any, reply) => {
    const assignments = await prisma.assignment.findMany({
      where: {
        class: {
          teacherId: req.user.id
        }
      },
      include: {
        quiz: { select: { title: true } },
        class: { select: { name: true } },
        _count: { select: { attempts: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { ok: true, assignments };
  });
};
