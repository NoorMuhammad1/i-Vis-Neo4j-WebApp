const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const PORT = 4000;
const neo4j = require("neo4j-driver");

//CONSTANTS
const DATABASE = "neo4j";
const USERNAME = "neo4j";
const PASSWORD = "Emmawatson00000#";

const driver = neo4j.driver(
  `bolt://127.0.0.1:7687//${DATABASE}`,
  neo4j.auth.basic(USERNAME, PASSWORD)
);
const session = driver.session();

app.get("/", async (req, res) => {
  try {
    const response = await driver.executeQuery(
      `MATCH path = (initialActor:Person {name: "Tom Hanks"})-[:ACTED_IN*..3]-(connectedActor)
      WHERE initialActor <> connectedActor 
      RETURN initialActor, connectedActor, path limit 4`
    );
    res.send(response.records);
  } catch (error) {
    res.send(error.message);
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is running at port " + PORT);
  }
});
