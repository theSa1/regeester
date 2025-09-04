import { ORPCError, os } from "@orpc/server";
import { authMiddleware } from "../auth-middleware";

export const getCurrentUser = os
  .use(authMiddleware)
  .handler(async ({ context }) => {
    if (!context.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    return {
      id: context.user.userId,
      email: context.user.email,
      name: context.user.name,
    };
  });
