import "dotenv/config";
import express, { type Application, type Request, type Response } from "express";
import { userRouter } from "./modules/users/user.route";
import { profileRoute } from "./modules/profiles/profile.route";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/users", userRouter);
app.use("/profiles", profileRoute);



app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is root route.",
    author: "TR TECH",
  });
});




export default app;
