import bcrypt from "bcryptjs";
import { pool } from "../../db";


const loginUserInDB = async(payload:{email:string, password:string })=>{

    const {email, password}= payload;

    const user = await pool.query(`
        SELECT * FROM users WHERE email= $1
        `,
    [email],
);
// console.log(user.rows[0]);
if(user.rowCount===0){
    throw new Error("invalid credentials!!");
};

const matchPassword = await bcrypt.compare(password, user.rows[0].password);

if(!matchPassword){
    throw new Error("invalid email or password!!");
};

};



export const authService = {
    loginUserInDB,

};

