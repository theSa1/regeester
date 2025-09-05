import { os } from "@orpc/server";
import { cookies } from "next/headers";
import { JWTPayload, validateJWT } from "./auth";

export const authMiddleware = os
  .$context<{
    user?: JWTPayload;
  }>()
  .middleware(async ({ next }) => {
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

    return next({
      context: {
        user: !user.valid || !user.decoded ? undefined : user.decoded,
      },
    });
  });
