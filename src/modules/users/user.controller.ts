import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
const result = await userService.createUserIntoDB(req.body)


    res.status(201).json({ success: true,
        message: "User created!",
        data: result.rows[0],
     });
  } catch (error: any) {
    res.status(500).json({ success: false,
        message: error.message });
  }
};


const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsersFromDB();

    return res.status(200).json({
      success: true,
      message: "Users list retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("GET /users failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




export const userController = {
    createUser,
    getUsers,
};
