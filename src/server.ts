import "dotenv/config";
import express, { type Application, type Request, type Response } from "express";
import { Pool } from "pg";

const app: Application = express();
const port = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectionString = process.env.DATABASE_URL_POOLED;
if (!connectionString) throw new Error("DATABASE_URL_POOLED is not set");

const pool = new Pool({ connectionString });

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        age INT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database connected!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
};

initDB();



app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is root route.",
    author: "TR TECH",
  });
});


app.post("/users", async (req: Request, res: Response) => {
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
});


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





app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});
