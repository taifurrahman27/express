import { pool } from "../../db";
import type { CreateProfilePayload } from "./profile.type";


const createProfileInDB = async (payload: CreateProfilePayload) => {
  const { user_id, bio, address, phone, gender } = payload;

  const result = await pool.query(
    `
    INSERT INTO profiles (user_id, bio, address, phone, gender)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [user_id, bio, address, phone, gender]
  );

  return result;
};

export const profileService = {
  createProfileInDB,

};
