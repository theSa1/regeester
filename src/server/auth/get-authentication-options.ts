import db from "@/lib/db";
import { os } from "@orpc/server";
import z from "zod";
import { parseTransports, rpID } from "./webauthn";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export const getAuthenticationOptions = os
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { email } = input;

      const user = await db.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (!user || user.passkeys.length === 0) {
        return { success: false, message: "No passkeys found for this user" };
      }

      const allowCredentials = user.passkeys.map((passkey) => ({
        id: passkey.credentialID,
        transports: parseTransports(passkey.transports) as any,
      }));

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials,
      });

      await db.user.update({
        where: { id: user.id },
        data: { currentChallenge: options.challenge },
      });

      return {
        success: true,
        data: options,
      };
    } catch (error) {
      console.error("Authentication options error:", error);
      return {
        success: false,
        message: "Failed to generate authentication options",
      };
    }
  });
