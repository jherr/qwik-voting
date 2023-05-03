import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form } from "@builder.io/qwik-city";
import prisma from "~/lib/prismaClient";

export const useCreateCategory = routeAction$(
  async (data) => {
    const category = await prisma.category.create({
      data,
    });
    return category;
  },
  zod$({
    name: z.string(),
  })
);

export default component$(() => {
  const createCategory = useCreateCategory();
  return (
    <div>
      <h1 class="test-3xl">Create Category</h1>
      <Form action={createCategory}>
        <label>Name</label>
        <input
          name="name"
          value={createCategory.formData?.get("name")}
          class="input input-bordered"
        />
        <button type="submit" class="btn">
          Create
        </button>
      </Form>
      {createCategory.value && (
        <div>
          <h2>Category created successfully!</h2>
        </div>
      )}
    </div>
  );
});
