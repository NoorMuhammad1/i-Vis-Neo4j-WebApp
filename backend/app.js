const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
const PORT = 4000;
const neo4j = require("neo4j-driver");
require("dotenv").config({ override: true });

const driver = neo4j.driver(
  `bolt://${process.env.HOST}:7687//${process.env.DATABASE}`,
  neo4j.auth.basic(process.env.USERNAME, process.env.PASSWORD)
);

app.get("/getMovies", async (req, res) => {
  const { actor } = req.query;
  try {
    const response = await driver.executeQuery(
      `match (actor:Person {name:"${actor}"})-[:ACTED_IN]->(movie:Movie) return  {name:properties(movie).title,label:"Movie",type:"node"}`
    );
    const output = response.records.map((record) => {
      return record._fields[0];
    });
    res.send(output);
  } catch (error) {
    console.log("error");
    res.send(error.message);
  }
});
app.get("/getActors", async (req, res) => {
  const { movie } = req.query;
  try {
    const response = await driver.executeQuery(
      `match (actor:Person)-[:ACTED_IN]->(movie:Movie {title:"${movie}"}) return {name:properties(actor).name,label:"Person",type:"node"}`
    );
    const output = response.records.map((record) => {
      return record._fields[0];
    });
    res.send(output);
  } catch (error) {
    console.log("error");
    res.send(error.message);
  }
});

app.get("/", async (req, res) => {
  const { actor, number } = req.query;
  try {
    const response = await driver.executeQuery(
      `match path=(actor:Person {name:"${actor}"})-[relation:ACTED_IN*1..${
        number * 2
      }]-(p:Person) 
      return 
      [node in nodes(path)| 
      case 
      when labels(node)[0]="Person" then {type:"node",label:labels(node)[0],name:properties(node).name}
      when labels(node)[0]="Movie" then {type:"node",label:labels(node)[0],name:properties(node).title}
      end 
      ] as path`
    );
    const nodes = {};
    const edges = [];
    response.records.forEach((record) => {
      var fields = record._fields[0];
      for (let i = 0; i < fields.length; i++) {
        let node = fields[i];
        nodes[node.name] = node;
        if (node.label === "Person") {
          if (i < fields.length - 1) {
            edges.push({
              from: node.name,
              to: fields[i + 1].name,
            });
          }
          if (i > 0) {
            edges.push({
              from: node.name,
              to: fields[i - 1].name,
            });
          }
        }
      }
      return fields;
    });
    res.send({ nodes: Object.values(nodes), edges });
  } catch (error) {
    console.log("error", error.message);
    res.send(error.message);
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log("Server is running at port " + PORT);
  }
});
