import jwt from "jsonwebtoken";
import { getRegistrationOptions } from "./get-registration-options";
import { verifyRegistration } from "./verify-registration";
import { getAuthenticationOptions } from "./get-authentication-options";
import { verifyAuthentication } from "./verify-authentication";
import { getCurrentUser } from "./get-current-user";

export const createJWT = (userId: string, username: string) => {
  const token = jwt.sign({ userId, username }, process.env.JWT_SECRET!);
  return token;
};

export const validateJWT = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      username: string;
    };
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
