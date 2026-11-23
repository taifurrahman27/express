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


app.get("/users", async (req: Request, res: Response)=>{
try {
  const result = await pool.query(`
    SELECT * FROM users
    `);

    res.status(200).json({
      success:true,
      message:"Users list retrived",
      data: result.rows,
    });

} catch (error:any) {
  res.status(404).json({
    success: false,
    message:error?.message,
    error:error,
  });
  
}
});




app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});
