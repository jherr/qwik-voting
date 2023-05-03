import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Restaurants",
    image: "restaurant.jpg",
    questions: [
      {
        question: "Best Mexican food",
        answers: [
          "El Buen Sazón",
          "Rio Adobe Southwest Cafe",
          "Frontera Grill Taco Truck",
          "Aqui Cupertino",
        ],
      },
      {
        question: "Best Thai food",
        answers: [
          "Siam Thai Cuisine",
          "Olarn Thai Cuisine",
          "Pineapple Thai",
          "Khaosan Thai Restaurant",
        ],
      },
      {
        question: "Best Indian food",
        answers: [
          "SpiceKlub",
          "Avachi Biryani House",
          "Dosateria",
          "Tandoori Oven",
        ],
      },
    ],
  },
  {
    name: "Bars",
    image: "bars.jpg",
    questions: [
      {
        question: "Best Brew Pub",
        answers: [
          "BJ's Restaurant & Brewhouse",
          "DC Tap House",
          "Gordon Biersch Brewery Restaurant",
          "Rock Bottom Restaurant & Brewery",
        ],
      },
      {
        question: "Best Sports Bar",
        answers: [
          "Park Lane lounge",
          "Paul & Eddie's Monta Vista Inn",
          "Final Score Sports Bar",
          "Walk-On's Sports Bistreaux",
        ],
      },
    ],
  },
  {
    name: "Breakfast Spots",
    image: "breakfast.jpg",
    questions: [
      {
        question: "Best Cafe",
        answers: [
          "HECHAA",
          "Bitter + Sweet",

          "Bobbi's Coffee Shop & Cafe",
          "K Cafe Patisserie & Tea House",
          "Voyager Coffee",
        ],
      },
      {
        question: "Best Breakfast",
        answers: [
          "Bobbi's Coffee Shop & Cafe",
          "Holder's Country Inn - Cupertino",
          "Sweet Maple",
        ],
      },
    ],
  },
];

async function main() {
  let voterIndex = 0;
  const votes: {
    answerId: number;
    questionId: number;
    email: string;
    random: number;
  }[] = [];
  for (const category of categories) {
    const { name, questions, image } = category;
    const categoryData = await prisma.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        image,
      },
    });
    for (const question of questions) {
      const { question: questionText, answers } = question;
      const questionData = await prisma.question.upsert({
        where: { question: questionText },
        update: {},
        create: {
          question: questionText,
          categoryId: categoryData.id,
        },
      });
      for (const answer of answers) {
        const answerData = await prisma.answer.create({
          data: {
            answer,
            questionId: questionData.id,
          },
        });
        const count = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < count; i++) {
          votes.push({
            answerId: answerData.id,
            questionId: questionData.id,
            email: `voter-${voterIndex++}@donotreply.com`,
            random: Math.random(),
          });
        }
      }
      for (const vote of votes.sort((a, b) => a.random - b.random)) {
        await prisma.vote.create({
          data: {
            answerId: vote.answerId,
            questionId: vote.questionId,
            email: vote.email,
          },
        });
      }
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
