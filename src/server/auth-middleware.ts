import { os } from "@orpc/server";
import { cookies } from "next/headers";
import { JWTPayload, validateJWT } from "./auth";

export const authMiddleware = os
  .$context<{
    user?: JWTPayload;
  }>()
  .middleware(
    async ({
      next,
    }): Promise<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      output: any;
      context: {
        user?: JWTPayload;
      };
    }> => {
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

      return next({
        context: {
          user: user.decoded,
        },
      });
    }
  );
