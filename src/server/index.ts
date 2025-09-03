import { authRouter } from "./auth";
import { formRouter } from "./form";
import { othersRouter } from "./others";

export const router = {
  auth: authRouter,
  form: formRouter,
  other: othersRouter,
};
