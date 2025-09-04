import { ORPCError, os } from "@orpc/server";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";

export const listForms = os.use(authMiddleware).handler(async ({ context }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const forms = await db.form.findMany({
    where: {
      createdBy: context.user.userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return forms;
});
