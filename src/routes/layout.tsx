import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { routeLoader$, Link, useLocation } from "@builder.io/qwik-city";
import prismaClient from "~/lib/prismaClient";

import Header from "~/components/header";

import styles from "./styles.css?inline";

export const useCategories = routeLoader$(async () => {
  const categories = await prismaClient.category.findMany();
  return categories;
});

const navItem = "p-2";
const navItemActive = `${navItem} bg-gray-300 text-black rounded-md font-bold`;

export default component$(() => {
  const categories = useCategories();

  useStyles$(styles);

  const location = useLocation();

  return (
    <>
      <Header />
      <main class="p-2">
        <div class="md:grid md:grid-cols-[20%_80%] gap-3">
          <div class="flex flex-col">
            <Link
              href="/"
              class={location.url.pathname === "/" ? navItemActive : navItem}
            >
              <div>Home</div>
            </Link>
            {categories.value?.map((category) => (
              <Link
                class={
                  location.url.pathname === `/categories/${category.id}/`
                    ? navItemActive
                    : navItem
                }
                href={`/categories/${category.id}`}
                key={category.id}
              >
                <div>{category.name}</div>
              </Link>
            ))}
          </div>
          <div>
            <Slot />
          </div>
        </div>
      </main>
    </>
  );
});
