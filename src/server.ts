import app from "./app";
import { initDB } from "./db";

const port = Number(process.env.PORT) || 5000;

const main =async()=>{
  initDB();
app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});
};

main();
