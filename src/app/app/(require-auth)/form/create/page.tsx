"use client";

import { FormBuilder } from "@/app/app/(require-auth)/_components/form-builder";

const Page = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase">Create New Form</h1>
      </div>

      <FormBuilder isEditing={false} submitButtonText="Create Form" />
    </>
  );
};

export default Page;
