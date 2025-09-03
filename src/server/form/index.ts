import { createForm } from "./create-form";
import { listForms } from "./list-forms";
import { getFormDetails } from "./get-form-details";
import { getFormResponses } from "./get-form-responses";
import { exportFormResponses } from "./export-form-responses";
import { updateForm } from "./update-form";
import { getPublicForm } from "./get-public-form";
import { submitFormResponse } from "./submit-form-response";

export const formRouter = {
  createForm,
  listForms,
  getFormDetails,
  getFormResponses,
  exportFormResponses,
  updateForm,
  getPublicForm,
  submitFormResponse,
};
