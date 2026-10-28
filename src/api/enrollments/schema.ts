import z from "zod";
import { amount } from "../../lib/validation";

export const enrollSchema = z
    .object({
        studentId: z.string().min(1, { error: "יש לבחור תלמידה" }),
        groupId: z.string().min(1, { error: "יש לבחור קבוצה" }),
        amountDue: amount
    })
export const paymentSchema = z
    .object({
        amountDue: amount,
        amountPaid: amount,
    })
    .superRefine((v, ctx) => {
        if (v.amountPaid > v.amountDue)
            ctx.addIssue({ code: "custom", message: "הסכום ששולם גבוה מהסכום לתשלום", path: ["amountPaid"] });
    }); 
export type EnrollFormData = z.infer<typeof enrollSchema>; 
export type PaymentFormData = z.infer<typeof paymentSchema>;    