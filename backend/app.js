const express = require("express");
const app = express();
const PORT = 4000;

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is running at port " + PORT);
  }
});
