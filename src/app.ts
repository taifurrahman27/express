import "dotenv/config";
import express, { type Application, type Request, type Response } from "express";
import { pool } from "./db";
import { userRouter } from "./modules/users/user.route";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/users", userRouter);


app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is root route.",
    author: "TR TECH",
  });
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