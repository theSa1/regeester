import { os } from "@orpc/server";
import { authMiddleware } from "../auth-middleware";
import db from "@/lib/db";

export const getDashboardData = os
  .use(authMiddleware)
  .handler(async ({ context }) => {
    const { user } = context;
    if (!user) {
      throw new Error("Unauthorized");
    }

    const formCount = await db.form.count({
      where: {
        createdBy: user.id,
      },
    });

    const responsesCount = await db.formSubmission.count({
      where: {
        form: {
          createdBy: user.id,
        },
      },
    });

    return {
      success: true,
      stats: {
        totalForms: formCount,
        totalResponses: responsesCount,
      },
    };
  });
