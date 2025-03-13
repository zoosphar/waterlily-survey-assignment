import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { useForm, UseFormReturn } from "react-hook-form";
import { api } from "../../lib/axios";
import {
  GET_FORM_FROM_ID_ENDPOINT,
  SUBMIT_FORM_ENDPOINT,
} from "../../lib/constants";
import { RadioGroup } from "../../components/ui/radio-group";
import { RadioGroupItem } from "../../components/ui/radio-group";
import { toast } from "sonner";
import type {
  Question,
  QuestionOption,
  QuestionResponse,
  FormData,
} from "../../lib/types";

const QuestionComponent = ({
  question,
  form,
}: {
  question: Question;
  form: UseFormReturn<any>;
}) => {
  if (question.questionType === "text") {
    return (
      <FormField
        control={form.control}
        name={question.id.toString()}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{question.questionTitle}</FormLabel>
            <FormControl>
              <Input placeholder="Your answer" {...field} />
            </FormControl>
            <FormDescription>{question.questionDescription}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  if (question.questionType === "single-option") {
    return (
      <>
        <FormLabel>{question.questionTitle}</FormLabel>
        {question.questionOptions.map((option: QuestionOption) => (
          <>
            <FormField
              control={form.control}
              key={option.id}
              name={question.id.toString()}
              render={({ field }) => (
                <>
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        key={option.id}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option.optionValue} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {option.optionTitle}
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                </>
              )}
            />
          </>
        ))}
      </>
    );
  }
};

export default function FormScreen({ formId }: { formId: string }) {
  const form = useForm();
  const [formData, setFormData] = useState<FormData | null>(null);

  const onSubmit = (data: any) => {
    const questionResponses: QuestionResponse[] = [];

    Object.entries(data).forEach(([key, value]) => {
      questionResponses.push({
        id: parseInt(key),
        questionAnswer: value as string,
      });
    });

    const formSubmissionPayload = {
      formId: formData?.form.id,
      questionResponses,
    };

    console.log("formSubmissionPayload: ", formSubmissionPayload);

    api
      .post(SUBMIT_FORM_ENDPOINT, formSubmissionPayload)
      .then((res) => {
        console.log("res: ", res);
        toast("Form submitted successfully", {
          description: "Thank you for submitting the form",
          action: {
            label: "View my responses",
            onClick: () => window.open(`/form/review/${formId}`, "_blank"),
          },
        });
      })
      .catch((error) => {
        toast.error("Error submitting form");
      });
  };

  useEffect(() => {
    api.get(GET_FORM_FROM_ID_ENDPOINT(formId)).then((res) => {
      setFormData(res.data);
    });
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formData?.questions.map((question) => (
          <QuestionComponent question={question} form={form} />
        ))}
        <Button type="submit" className="bg-blue-500 text-white flex-1 w-full">
          Submit
        </Button>
      </form>
    </Form>
  );
}
