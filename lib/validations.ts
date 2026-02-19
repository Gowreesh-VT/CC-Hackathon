import { z } from "zod";

export const scoreSchema = z.object({
    score: z.number().min(0, "Score must be at least 0").max(20, "Score cannot exceed 20"),
    remarks: z.string().optional(),
});

export const submissionSchema = z.object({
    roundId: z.string().min(1, "Round ID is required"),
    fileUrl: z.string().url("Invalid file URL").optional().or(z.literal("")),
    githubLink: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
    overview: z.string().optional(),
});

export const judgeSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const roundSchema = z.object({
    round_number: z.number().int().positive("Round number must be a positive integer"),
    start_time: z.string().datetime().optional().nullable(),
    end_time: z.string().datetime().optional().nullable(),
    instructions: z.string().optional(),
});

export const subtaskSchema = z.object({
    round_id: z.string().min(1, "Round ID is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    points: z.number().int().nonnegative("Points cannot be negative").optional(),
});
