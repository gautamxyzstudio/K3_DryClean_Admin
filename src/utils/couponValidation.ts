import { z } from "zod";

const numberSchema = (msg: string) =>
  z.union([
    z.number({ message: msg }),
    z.string().transform((val, ctx) => {
      const num = Number(val);
      if (val.trim() === "" || isNaN(num)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msg,
        });
        return z.NEVER;
      }
      return num;
    }),
  ]);

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(30, "Coupon code cannot exceed 30 characters")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Code can only contain uppercase letters, numbers, underscores (_), and hyphens (-)"
      ),
    title: z
      .string()
      .min(2, "Title is required and must be at least 2 characters")
      .max(100, "Title cannot exceed 100 characters"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .nullable(),
    discount_type: z.enum(["FLAT", "PERCENTAGE"], {
      message: "Please select a valid discount type",
    }),
    discount_value: numberSchema("Discount value must be a valid number").pipe(
      z.number().positive("Discount value must be greater than 0")
    ),
    min_order_amount: numberSchema("Minimum order amount must be a valid number")
      .pipe(z.number().min(0, "Minimum order amount cannot be negative"))
      .default(0),
    max_discount_amount: z
      .union([
        numberSchema("Max discount amount must be a valid number").pipe(
          z.number().positive("Max discount amount must be greater than 0")
        ),
        z.null(),
        z.undefined(),
      ])
      .nullable()
      .optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    is_unlimited_total: z.boolean().default(false),
    usage_limit: z
      .union([
        numberSchema("Usage limit must be a valid number").pipe(
          z.number().positive("Usage limit must be greater than 0")
        ),
        z.null(),
        z.undefined(),
      ])
      .nullable()
      .optional(),
    is_unlimited_per_user: z.boolean().default(false),
    usage_limit_per_user: z
      .union([
        numberSchema("Usage limit per user must be a valid number").pipe(
          z.number().positive("Usage limit per user must be greater than 0")
        ),
        z.null(),
        z.undefined(),
      ])
      .nullable()
      .optional(),
    is_active: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    // Percentage validation: 1 to 100
    if (
      data.discount_type === "PERCENTAGE" &&
      (data.discount_value < 1 || data.discount_value > 100)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount must be between 1% and 100%",
        path: ["discount_value"],
      });
    }

    // End date must be after Start date
    if (data.start_date && data.end_date) {
      const startTime = new Date(data.start_date).getTime();
      const endTime = new Date(data.end_date).getTime();
      if (!isNaN(startTime) && !isNaN(endTime) && endTime <= startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date must be strictly after the start date",
          path: ["end_date"],
        });
      }
    }

    // If total usage is not unlimited, usage_limit must be provided
    if (!data.is_unlimited_total && (!data.usage_limit || data.usage_limit <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid usage limit or select 'Unlimited'",
        path: ["usage_limit"],
      });
    }

    // If per-user usage is not unlimited, usage_limit_per_user must be provided
    if (
      !data.is_unlimited_per_user &&
      (!data.usage_limit_per_user || data.usage_limit_per_user <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid limit per user or select 'Unlimited'",
        path: ["usage_limit_per_user"],
      });
    }
  });

export type CouponFormInput = z.input<typeof couponFormSchema>;
export type CouponFormData = z.infer<typeof couponFormSchema>;

