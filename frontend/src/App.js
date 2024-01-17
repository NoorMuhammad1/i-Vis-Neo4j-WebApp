import axios from "axios";
import { useEffect, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const NODE_COLORS = {
  Movie: "red",
  Person: "blue",
  Movie: "red",
};
function App() {
  const [elements, setElements] = useState([]);

  const apiCall = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000");
      console.log(data);
      var value = [];
      data.forEach((element) => {
        let label = element._fields[0].labels[0];
        let val = {
          data: {
            group: "nodes",
            color: NODE_COLORS[label],
          },
        };
        if (label === "Movie") {
          val.data.id = element._fields[0].properties.title;
          val.data.label = element._fields[0].properties.title;
          val.data.parent = "movie";
        } else if (label === "Person") {
          val.data.id = element._fields[0].properties.name;
          val.data.label = element._fields[0].properties.name;
          val.data.parent = "person";
        }
        value.push(val);
      });
      setElements(value);
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  useEffect(() => {
    apiCall();
  }, []);
  // const elements = [
  //   { data: { id: "a" } },
  //   { data: { id: "b" } },
  //   { data: { id: "c" } },
  //   { data: { id: "ab", source: "a", target: "b" } },
  //   { data: { id: "bc", source: "b", target: "c" } },
  //   { data: { id: "ca", source: "c", target: "a" } },
  // ];
  return (
    <div className="App">
      <h1>Hello How are you</h1>
      <button onClick={apiCall}>Make API Call</button>
      <CytoscapeComponent
        style={{
          width: "600px",
          height: "600px",
          borderColor: "black",
          borderWidth: "2px",
          borderBlockStyle: "double",
        }}
        elements={elements}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-color": "data(color)",
              label: "data(id)",
            },
          },
          {
            selector: "edge",
            style: {
              "line-color": "#95a5a6",
            },
          },
        ]}
        layout={{ name: "random" }}
        userZoomingEnabled={false}
      />
    </div>
  );
}

export default App;
