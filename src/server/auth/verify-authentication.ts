import db from "@/lib/db";
import { os } from "@orpc/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import z from "zod";
import { rpID, origin } from "./webauthn";
import { cookies } from "next/headers";
import { createJWT } from ".";

export const verifyAuthentication = os
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
      authenticationResponse: z.any(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { email, authenticationResponse } = input;

      const user = await db.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (!user || !user.currentChallenge) {
        return { success: false, message: "Invalid authentication attempt" };
      }

      // Find the specific passkey being used
      const passkey = user.passkeys.find(
        (p) => p.credentialID === authenticationResponse.id
      );

      if (!passkey) {
        return { success: false, message: "Passkey not found" };
      }

      // Verify the authentication response
      const verification = await verifyAuthenticationResponse({
        response: authenticationResponse,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: passkey.credentialID,
          publicKey: passkey.credentialPublicKey,
          counter: Number(passkey.counter),
        },
      });

      if (!verification.verified) {
        return {
          success: false,
          message: "Authentication verification failed",
        };
      }

      // Update the counter for replay protection
      await db.passkey.update({
        where: { id: passkey.id },
        data: { counter: BigInt(verification.authenticationInfo.newCounter) },
      });

      // Clear the challenge
      await db.user.update({
        where: { id: user.id },
        data: { currentChallenge: null },
      });

      const cookieStore = await cookies();
      cookieStore.set("token", createJWT(user.id, user.email, user.name));

      return {
        success: true,
        message: "Authentication successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error("Authentication verification error:", error);
      return {
        success: false,
        message: "Authentication failed",
      };
    }
  });
