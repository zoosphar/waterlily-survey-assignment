import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import { GET_FORM_REVIEW_ENDPOINT } from "../../lib/constants";
import type { FormData } from "../../lib/types";

export default function ViewFormResponses({ formId }: { formId: string }) {
  const [formResponses, setFormResponses] = useState<FormData | null>(null);

  useEffect(() => {
    api.get(GET_FORM_REVIEW_ENDPOINT(formId)).then((res) => {
      console.log("form responses: ", res.data);
      setFormResponses(res.data);
    });
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold">{formResponses?.form.formTitle}</h1>
      <p className="text-sm text-gray-500">
        {formResponses?.form.formDescription}
      </p>
      <div className="mt-4">
        {formResponses?.questions.map((question) => (
          <div key={question.id}>
            <h2 className="text-lg font-bold">{question.questionTitle}</h2>
            <p className="text-sm text-gray-500">
              {question.questionDescription}
            </p>
            <p className="text-sm text-gray-500">
              A - {question.questionAnswer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
