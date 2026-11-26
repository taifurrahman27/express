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


const updateUserInDB = async (payload:any, id :number)=>{
  const {name , password, age, is_active}= payload
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
return result;
};


const deleteUserFromDB = async (id:number)=>{
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, name, email`,
      [id]
    );
    return result;
};


export const userService ={
    createUserIntoDB,
    getUsersFromDB,
    getSingleUserFromDB,
    updateUserInDB,
    deleteUserFromDB,

};