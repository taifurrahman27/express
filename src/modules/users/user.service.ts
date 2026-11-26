import type { Response } from "express";
import { pool } from "../../db";
import type { IUser } from "./user.interface";

const createUserIntoDB = async(payload:IUser)=>{
 const { name, email, password, age } = payload;
    const result = await pool.query(
      "INSERT INTO users (name, email, password, age) VALUES ($1, $2, $3, $4) RETURNING id, name, email, age, is_active, created_at",
      [name, email, password, age]
    );
    return result;
};


const getUsersFromDB = async ()=>{
  const result = await pool.query(
      `SELECT * FROM users ORDER BY id`
    );
    return result;
};


const getSingleUserFromDB = async(id:number, res:Response)=>{
      const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    };
return result;
};



export const userService ={
    createUserIntoDB,
    getUsersFromDB,
    getSingleUserFromDB,

};