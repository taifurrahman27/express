import type { Request, Response } from "express";
import { pool } from "../../db";

const createUser = async (req: Request, res: Response) => {
  const { name, email, password, age } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING id, name, email, age, is_active, created_at",
      [name, email, password, age]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const userController = {
    createUser
}
