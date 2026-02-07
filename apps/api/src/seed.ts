import { prisma } from "./prisma";

function code(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function main() {
  const teacher = await prisma.teacher.upsert({
    where: { email: "akif@local.dev" },
    update: {},
    create: { email: "akif@local.dev" }
  });

  const cls = await prisma.class.upsert({
    where: { teacherId_name: { teacherId: teacher.id, name: "6A" } },
    update: {},
    create: { name: "6A", teacherId: teacher.id }
  });

  await prisma.student.createMany({
    data: [
      { classId: cls.id, studentNo: "123", firstName: "Ayşe", lastName: "Yılmaz" },
      { classId: cls.id, studentNo: "456", firstName: "Mehmet", lastName: "Demir" }
    ],
    skipDuplicates: true
  });

  const q1 = await prisma.question.create({
    data: {
      text: "Kuvvetin birimi nedir?",
      a: "Newton",
      b: "Joule",
      c: "Watt",
      d: "Pascal",
      correct: "A",
      timeLimitSec: 20
    }
  });

  const quiz = await prisma.quiz.create({
    data: {
      title: "Fen - Kuvvet (Demo)",
      questions: { create: [{ questionId: q1.id, order: 1 }] }
    }
  });

  const assignment = await prisma.assignment.create({
    data: {
      quizId: quiz.id,
      classId: cls.id,
      joinCode: code(6)
    }
  });

  console.log("Seed OK");
  console.log("JOIN CODE:", assignment.joinCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
