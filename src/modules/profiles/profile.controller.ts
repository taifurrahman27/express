import type { Request, Response } from "express";
import { profileService } from "./profile.service";


const createProfile = async (req: Request, res: Response) => {
  try {
    const result = await profileService.createProfileInDB(req.body);

    return res.status(201).json({
      success: true,
      message: "Profile created successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    console.error("createProfile failed:", error);

    if (typeof error === "object" && error !== null && (error as any).code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A profile with this value already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error instanceof Error
            ? error.message
            : "Unknown error",
    });
  }
};


export const profileController = {
  createProfile,

};