import {
  component$,
  useComputed$,
  $,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$, server$ } from "@builder.io/qwik-city";

import { useAuthSession } from "~/routes/plugin@auth";

import { type Question } from "@prisma/client";

import prisma from "~/lib/prismaClient";
import createThankYou from "~/lib/openai";

import { VoteTally } from "~/types";

import Answers from "~/components/answers";

const vote = server$(
  async (email: string, questionId: number, answerId: number) => {
    await prisma.vote.deleteMany({
      where: { email, questionId },
    });

    await prisma.vote.create({
      data: {
        email,
        questionId,
        answerId,
      },
    });

    const question = await prisma.question.findFirst({
      where: { id: questionId },
    });
    const questions = await prisma.question.findMany({
      where: { categoryId: question?.categoryId ?? 0 },
      include: {
        answers: true,
      },
    });

    const answer = await prisma.answer.findFirst({
      where: { id: answerId },
    });

    const votes = await getVotes(questions);

    return {
      votes,
      thankYou: await createThankYou(
        question?.question ?? "",
        answer?.answer ?? ""
      ),
    };
  }
);

const getVotes = async (questions: Question[]): Promise<VoteTally[]> =>
  (
    await prisma.vote.groupBy({
      where: { questionId: { in: questions.map((q) => q.id) } },
      by: ["questionId", "answerId"],
      _count: {
        answerId: true,
      },
    })
  ).map(({ questionId, answerId, _count }) => ({
    questionId,
    answerId,
    count: _count?.answerId ?? 0,
  }));

export const useQuestions = routeLoader$(async ({ params, status }) => {
  const categoryId = parseInt(params["categoryId"], 10);
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    // Set the status to 404 if the user is not found
    status(404);
  }

  const questions = await prisma.question.findMany({
    where: { categoryId: categoryId },
    include: {
      answers: true,
    },
  });

  const votes = await getVotes(questions);

  return { questions, votes };
});

export default component$(() => {
  const questions = useQuestions();
  const session = useAuthSession();

  const response = useSignal<string | undefined>();
  const updatedVotes = useSignal<VoteTally[]>();

  useVisibleTask$(({ track }) => {
    track(() => response.value);

    if (response.value) {
      setTimeout(() => {
        response.value = undefined;
      }, 3000);
    }
  });

  const onVote = $(async (questionId: number, answerId: number) => {
    const voteResponse = await vote(
      session.value?.user?.email ?? "",
      questionId,
      answerId
    );
    response.value = voteResponse.thankYou;
    updatedVotes.value = voteResponse.votes;
  });

  const voteTallies = useComputed$(
    () => updatedVotes.value ?? questions.value?.votes ?? []
  );

  return (
    <>
      {response.value && (
        <div class="toast toast-top toast-end">
          <div class="alert alert-success">
            <div>
              <span>{response.value}</span>
            </div>
          </div>
        </div>
      )}
      {questions.value?.questions.map((question) => (
        <div key={question.id} class="mt-3 mb-6">
          <div class="text-2xl font-bold mb-3">{question.question}</div>
          <Answers
            question={question}
            answers={question.answers}
            voteTallies={voteTallies}
            loggedIn={!!session.value?.user}
            onVote$={onVote}
          />
        </div>
      ))}
    </>
  );
});
