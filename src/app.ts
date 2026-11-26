import "dotenv/config";
import express, { type Application, type Request, type Response } from "express";
import { initDB, pool } from "./db";
import { userRouter } from "./modules/users/user.route";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is root route.",
    author: "TR TECH",
  });
});


app.use("/", userRouter);





app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users ORDER BY id`
    );

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
});



app.get("/users/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
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
  }
});




app.put("/users/:id", async (req: Request, res: Response) => {
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
    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           password = COALESCE($2, password),
           age = COALESCE($3, age),
           is_active = COALESCE($4, is_active),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, age, is_active, created_at, updated_at`,
      [name ?? null, password ?? null, age ?? null, is_active ?? null, id]
    );

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
});



app.delete("/users/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
      [id]
    );

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
});



export default app