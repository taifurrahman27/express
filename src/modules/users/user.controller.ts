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


const getSingleUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
const result = await userService.getSingleUserFromDB(id as number,res);

    if (!("rows" in result)) {
      return result;
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("GET /users/:id failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  };
};





export const userController = {
    createUser,
    getUsers,
    getSingleUser,
};
