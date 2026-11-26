import type { Request, Response } from "express";
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


const updateUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const { name, password, age, is_active } = req.body;

  if (
    name === undefined &&
    password === undefined &&
    age === undefined &&
    is_active === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide at least one field to update (name, password, age, is_active)",
    });
  }

  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return res.status(400).json({ success: false, message: "Invalid name" });
  }
  if (age !== undefined && (!Number.isInteger(age) || age < 0)) {
    return res.status(400).json({ success: false, message: "Invalid age" });
  }
  if (is_active !== undefined && typeof is_active !== "boolean") {
    return res.status(400).json({ success: false, message: "is_active must be a boolean" });
  }
  if (password !== undefined && (typeof password !== "string" || password.length < 8)) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  try {
const result = await userService.updateUserInDB(req.body, id as number)

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("PUT /users/:id failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


const deleteUser =  async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
  const result = await userService.deleteUserFromDB(id as number);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(409).json({
        success: false,
        message: "Cannot delete user because related records exist",
      });
    }

    console.error("DELETE /users/:id failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

};


export const userController = {
    createUser,
    getUsers,
    getSingleUser,
    updateUser,
    deleteUser,

};
