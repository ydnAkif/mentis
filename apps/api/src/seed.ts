import { prisma } from "./prisma";

function code(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

const QUESTIONS = [
  {
    text: "Kuvvetin SI birimi nedir?",
    a: "Newton",
    b: "Joule",
    c: "Watt",
    d: "Pascal",
    correct: "A",
    timeLimitSec: 20,
  },
  {
    text: "Işığın vakumdaki hızı yaklaşık kaç km/s'dir?",
    a: "100.000 km/s",
    b: "200.000 km/s",
    c: "300.000 km/s",
    d: "400.000 km/s",
    correct: "C",
    timeLimitSec: 25,
  },
  {
    text: "Suyun kimyasal formülü nedir?",
    a: "CO₂",
    b: "H₂O",
    c: "NaCl",
    d: "O₂",
    correct: "B",
    timeLimitSec: 15,
  },
  {
    text: "Fotosentez hangi organelde gerçekleşir?",
    a: "Mitokondri",
    b: "Ribozom",
    c: "Çekirdek",
    d: "Kloroplast",
    correct: "D",
    timeLimitSec: 25,
  },
  {
    text: "İnsan vücudundaki en uzun kemik hangisidir?",
    a: "Tibia",
    b: "Humerus",
    c: "Femur",
    d: "Radius",
    correct: "C",
    timeLimitSec: 30,
  },
];

async function main() {
  // ── Teacher ─────────────────────────────────
  const teacher = await prisma.teacher.upsert({
    where: { email: "akif@local.dev" },
    update: {},
    create: { email: "akif@local.dev", password: "password" },
  });

  // ── Class ────────────────────────────────────
  const cls = await prisma.class.upsert({
    where: { teacherId_name: { teacherId: teacher.id, name: "6A" } },
    update: {},
    create: { name: "6A", teacherId: teacher.id },
  });

  // ── Students ─────────────────────────────────
  await prisma.student.createMany({
    data: [
      {
        classId: cls.id,
        studentNo: "123",
        firstName: "Ayşe",
        lastName: "Yılmaz",
      },
      {
        classId: cls.id,
        studentNo: "456",
        firstName: "Mehmet",
        lastName: "Demir",
      },
      {
        classId: cls.id,
        studentNo: "789",
        firstName: "Zeynep",
        lastName: "Kaya",
      },
    ],
    skipDuplicates: true,
  });

  // ── Wipe old quiz data (idempotent seed) ─────
  await prisma.answer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.question.deleteMany({});

  // ── Create questions ─────────────────────────
  const createdQuestions = await Promise.all(
    QUESTIONS.map((q) => prisma.question.create({ data: q })),
  );

  // ── Create quiz ──────────────────────────────
  const quiz = await prisma.quiz.create({
    data: {
      title: "Fen Bilimleri Demo Quiz",
      questions: {
        create: createdQuestions.map((q, i) => ({
          questionId: q.id,
          order: i + 1,
        })),
      },
    },
  });

  // ── Create assignment ─────────────────────────
  const assignment = await prisma.assignment.create({
    data: {
      quizId: quiz.id,
      classId: cls.id,
      joinCode: code(6),
    },
  });

  console.log("\n✅ Seed tamamlandı!\n");
  console.log(`📌 JOIN CODE : ${assignment.joinCode}`);
  console.log(`📝 Quiz     : ${quiz.title} (${createdQuestions.length} soru)`);
  console.log("\n👤 Test öğrencileri:");
  console.log("   Ayşe Yılmaz   → okul no: 123");
  console.log("   Mehmet Demir  → okul no: 456");
  console.log("   Zeynep Kaya   → okul no: 789\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
