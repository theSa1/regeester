import { os } from "@orpc/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import z from "zod";
import { rpID, stringifyTransports, origin } from "./webauthn";
import { cookies } from "next/headers";
import { createJWT } from ".";
import db from "@/lib/db";

export const verifyRegistration = os
  .input(
    z.object({
      email: z.string().email("Please enter a valid email address"),
      name: z.string().min(1, "Name is required"),
      registrationResponse: z.any(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { email, name, registrationResponse } = input;

      const user = await db.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });

      if (!user || !user.currentChallenge) {
        return { success: false, message: "Invalid registration attempt" };
      }

      // Verify the registration response
      const verification = await verifyRegistrationResponse({
        response: registrationResponse,
        expectedChallenge: user.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return {
          success: false,
          message: "Registration verification failed",
        };
      }

      const { registrationInfo } = verification;

      // Check if this credential ID already exists
      const credentialIDBase64 = registrationResponse.id;
      const existingPasskey = await db.passkey.findUnique({
        where: { credentialID: credentialIDBase64 },
      });

      if (existingPasskey) {
        return { success: false, message: "Credential already registered" };
      }

      // Save the passkey to the database
      await db.passkey.create({
        data: {
          userId: user.id,
          credentialID: credentialIDBase64,
          credentialPublicKey: registrationInfo.credential.publicKey,
          counter: BigInt(registrationInfo.credential.counter),
          transports: stringifyTransports(
            registrationResponse.response.transports || []
          ),
          authenticatorAAGUID: registrationInfo.aaguid,
          credentialBackedUp: registrationInfo.credentialBackedUp,
          credentialDeviceType: registrationInfo.credentialDeviceType,
        },
      });

      // Clear the challenge and update user info
      await db.user.update({
        where: { id: user.id },
        data: {
          currentChallenge: null,
          name: name || user.name,
        },
      });

      const cookieStore = await cookies();
      cookieStore.set("token", createJWT(user.id, user.email, user.name));

      return {
        success: true,
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      console.error("Registration verification error:", error);
      return { success: false, message: "Registration failed" };
    }
  });
