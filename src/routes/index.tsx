import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, Link } from "@builder.io/qwik-city";

import prismaClient from "~/lib/prismaClient";

export const useCategories = routeLoader$(async () => {
  const categories = await prismaClient.category.findMany();
  return categories;
});

export default component$(() => {
  const categories = useCategories();
  return (
    <div class="grid xs:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {categories.value?.map((category) => (
        <Link href={`/categories/${category.id}`} key={category.id}>
          <div class="p-2">
            <div class="card w-full glass">
              <figure>
                <img src={`/${category.image}`} alt={category.name} />
              </figure>
              <div class="card-body">
                <h2 class="card-title">{category.name}</h2>
                <div class="card-actions justify-end">
                  <button class="btn btn-primary">Vote now!</button>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik Voting",
  meta: [],
};
