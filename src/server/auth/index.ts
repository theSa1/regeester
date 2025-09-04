import jwt from "jsonwebtoken";
import { getRegistrationOptions } from "./get-registration-options";
import { verifyRegistration } from "./verify-registration";
import { getAuthenticationOptions } from "./get-authentication-options";
import { verifyAuthentication } from "./verify-authentication";
import { getCurrentUser } from "./get-current-user";

export type JWTPayload = {
  userId: string;
  email: string;
  name: string;
};

export const createJWT = (userId: string, email: string, name: string) => {
  const token = jwt.sign(
    { userId, email, name } as JWTPayload,
    process.env.JWT_SECRET!
  );
  return token;
};

export const validateJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error };
  }
};

export const authRouter = {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  getCurrentUser,
};
