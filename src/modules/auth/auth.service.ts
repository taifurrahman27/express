import bcrypt from "bcryptjs";
import { pool } from "../../db";
import jwt from "jsonwebtoken";


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


const jwtPayload ={
    id: user.rows[0].id,
    name: user.rows[0].name,
    email : user.rows[0].email,
};

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set");
}

const accessToken = jwt.sign(jwtPayload, secret, { expiresIn: "2d" });

delete user.rows[0].password;
return {accessToken, use:user.rows[0]};
};



export const authService = {
    loginUserInDB,

};

