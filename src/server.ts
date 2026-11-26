import app from "./app";

const port = Number(process.env.PORT) || 5000;


const main =async()=>{
  
app.listen(port, () => {
  console.log(`Express app running on port ${port}`);
});

};

main();