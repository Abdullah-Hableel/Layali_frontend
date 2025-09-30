import * as Yup from "yup";

export const EventSchema = Yup.object({
  budget: Yup.number()
    .typeError("Budget must be a number")
    .min(100, "Budget must be at least 100")
    .required("Budget is required"),
  date: Yup.string().required("Date is required"),
  address1: Yup.string()
    .min(4, "Address Line 1 is too short")
    .required("Address Line 1 is required"),
  address2: Yup.string().max(120, "Address Line 2 is too long").optional(),
});

export const UpdateEventSchema = Yup.object({
  budget: Yup.number()
    .typeError("Budget must be a number")
    .min(100, "Budget must be at least 100")
    .optional(), //
  date: Yup.date().min(new Date(), "Date cannot be in the past").optional(),
  address1: Yup.string().min(4, "Address Line 1 is too short").optional(),
  address2: Yup.string().max(120, "Address Line 2 is too long").optional(),
});
