const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/* ───────────────────────────────
   CONFIGURATION
────────────────────────────── */

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
];

const levels = ["fresher", "junior", "mid"];

/* ───────────────────────────────
   QUESTION GENERATOR (TEMPLATE)
   5 questions per difficulty per role
────────────────────────────── */

const generateQuestionsForRole = (role, level) => {
  const base = role.replace(" Developer", "").toLowerCase();

  return [
    // EASY (5)
    {
      question_id: `${base}_easy_1`,
      question: `What is ${base}?`,
      role,
      experience_level: level,
      difficulty: "easy",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_easy_2`,
      question: `Explain basic concepts of ${base}`,
      role,
      experience_level: level,
      difficulty: "easy",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_easy_3`,
      question: `Why is ${base} important?`,
      role,
      experience_level: level,
      difficulty: "easy",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_easy_4`,
      question: `Where is ${base} used in real projects?`,
      role,
      experience_level: level,
      difficulty: "easy",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_easy_5`,
      question: `Explain fundamentals of ${base}`,
      role,
      experience_level: level,
      difficulty: "easy",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },

    // MEDIUM (5)
    {
      question_id: `${base}_medium_1`,
      question: `Explain intermediate concepts in ${base}`,
      role,
      experience_level: level,
      difficulty: "medium",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_medium_2`,
      question: `How does ${base} work internally?`,
      role,
      experience_level: level,
      difficulty: "medium",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_medium_3`,
      question: `Compare ${base} with similar technologies`,
      role,
      experience_level: level,
      difficulty: "medium",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_medium_4`,
      question: `What are common challenges in ${base}?`,
      role,
      experience_level: level,
      difficulty: "medium",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_medium_5`,
      question: `Explain real-world use case of ${base}`,
      role,
      experience_level: level,
      difficulty: "medium",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },

    // HARD (5)
    {
      question_id: `${base}_hard_1`,
      question: `Explain advanced architecture of ${base}`,
      role,
      experience_level: level,
      difficulty: "hard",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_hard_2`,
      question: `How do you optimize ${base} performance?`,
      role,
      experience_level: level,
      difficulty: "hard",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_hard_3`,
      question: `Design a scalable system using ${base}`,
      role,
      experience_level: level,
      difficulty: "hard",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_hard_4`,
      question: `What are limitations of ${base}?`,
      role,
      experience_level: level,
      difficulty: "hard",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
    {
      question_id: `${base}_hard_5`,
      question: `Deep dive into ${base} internals`,
      role,
      experience_level: level,
      difficulty: "hard",
      topic: base,
      tags: [base],
      jd_keywords: [base],
    },
  ];
};

/* ───────────────────────────────
   SEED FUNCTION
────────────────────────────── */

const seed = async () => {
  const batch = db.batch();

  roles.forEach((role) => {
    levels.forEach((level) => {
      const questions = generateQuestionsForRole(role, level);

      questions.forEach((q) => {
        const ref = db.collection("questions_bank").doc(q.question_id);

        batch.set(ref, {
          ...q,
          usageCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    });
  });

  await batch.commit();

  console.log("ALL QUESTIONS SEEDED SUCCESSFULLY!");
};

seed().catch(console.error);