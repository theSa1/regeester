import db from "@/lib/db";
import { parseTransports, rpID, rpName } from "@/server/auth/webauthn";
import { os } from "@orpc/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import z from "zod";

export const getRegistrationOptions = os
  .input(
    z.object({
      username: z.string().min(2).max(100),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { username, email, phoneNumber } = input;
      let user = await db.user.findUnique({
        where: { username },
        include: { passkeys: true },
      });

      // Get existing credentials to exclude them from new registration
      const excludeCredentials =
        user?.passkeys.map((passkey) => ({
          id: passkey.credentialID,
          transports: parseTransports(passkey.transports) as any,
        })) || [];

      const options: PublicKeyCredentialCreationOptionsJSON =
        await generateRegistrationOptions({
          rpID,
          rpName,
          userName: username,
          userDisplayName: username,
          excludeCredentials,
        });

      // Store the challenge for verification
      if (!user) {
        user = await db.user.create({
          data: {
            username,
            email,
            phoneNumber,
            currentChallenge: options.challenge,
          },
          include: { passkeys: true },
        });
      } else {
        await db.user.update({
          where: { id: user.id },
          data: {
            currentChallenge: options.challenge,
            email: email || user.email,
            phoneNumber: phoneNumber || user.phoneNumber,
          },
        });
      }

      return {
        success: true,
        data: options,
      };
    } catch (error) {
      console.error("Registration options error:", error);
      return {
        success: false,
        message: "Failed to generate registration options",
      };
    }
  });
