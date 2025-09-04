import db from "@/lib/db";
import { parseTransports, rpID, rpName } from "@/server/auth/webauthn";
import { os } from "@orpc/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import z from "zod";

export const getRegistrationOptions = os
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
      name: z.string().min(1, "Name is required"),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { email, name } = input;
      let user = await db.user.findUnique({
        where: { email },
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
          userName: email,
          userDisplayName: name,
          excludeCredentials,
        });

      // Store the challenge for verification
      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name,
            currentChallenge: options.challenge,
          },
          include: { passkeys: true },
        });
      } else {
        await db.user.update({
          where: { id: user.id },
          data: {
            currentChallenge: options.challenge,
            name: name || user.name,
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
