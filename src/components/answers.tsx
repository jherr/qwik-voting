import { component$, type PropFunction, type Signal } from "@builder.io/qwik";
import { type Answer, type Question } from "@prisma/client";

import { type VoteTally } from "~/types";

const Answers = component$(
  ({
    question,
    answers,
    voteTallies,
    loggedIn,
    onVote$,
  }: {
    question: Question;
    answers: Answer[];
    voteTallies: Signal<VoteTally[]>;
    loggedIn: boolean;
    onVote$?: PropFunction<(questionId: number, answerId: number) => void>;
  }) => {
    return (
      <div class="px-5 grid grid-cols-[40%_25%_25%_10%] gap-2">
        {answers.map((answer) => {
          const votes =
            voteTallies.value.find(({ answerId }) => answerId === answer.id)
              ?.count ?? 0;

          const totalVotes = voteTallies.value
            .filter(({ questionId }) => questionId === question.id)
            ?.reduce((acc, { count }) => acc + (count ?? 0), 0);

          return (
            <>
              <div>{answer.answer}</div>
              <div class="flex justify-center">
                {loggedIn && (
                  <button
                    class="btn btn-primary btn-sm px-10"
                    onClick$={() => onVote$?.(question.id, answer.id)}
                  >
                    Vote
                  </button>
                )}
              </div>
              <div>
                <progress
                  class="progress progress-error w-full"
                  value={Math.round((votes / totalVotes) * 100) || 0}
                  max="100"
                ></progress>
              </div>
              <div>{votes} votes</div>
            </>
          );
        })}
      </div>
    );
  }
);

export default Answers;
