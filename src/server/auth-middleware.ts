import { User } from "@/generated/prisma";
import { os } from "@orpc/server";
import { cookies } from "next/headers";
import { validateJWT } from "./auth";
import db from "@/lib/db";

export const authMiddleware = os
  .$context<{ user?: User }>()
  .middleware(async ({ context, next }) => {
    const cookieStore = await cookies();

    const token = cookieStore.get("token");

    if (!token) {
      return next({
        context: {
          user: undefined,
        },
      });
    }

    const user = validateJWT(token.value);

    if (!user.valid || !user.decoded) {
      return next({
        context: {
          user: undefined,
        },
      });
    }

    const dbUser = await db.user.findFirst({
      where: {
        id: user.decoded.userId,
      },
    });

    return next({
      context: {
        user: dbUser || undefined,
      },
    });
  });
