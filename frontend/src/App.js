import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import contextMenus from "cytoscape-context-menus";
Cytoscape.use(fcose);
Cytoscape.use(contextMenus);

const NODE_COLORS = {
  Movie: "red",
  Person: "blue",
};
function App() {
  const [request, setRequest] = useState({
    actor: "",
    number: 0,
  });
  var myCyRef = useRef();
  const renderGraph = (ref, data) => {
    ref.elements().remove();
    const { nodes, edges } = data;
    nodes.forEach((node) => {
      if (ref.getElementById(node.name).length === 0) {
        ref.add({
          data: {
            group: node.label,
            id: node.name,
            color: NODE_COLORS[node.label],
          },
        });
      }
    });
    edges.forEach((edge) => {
      if (ref.getElementById(`${edge.from}_${edge.to}`).length === 0) {
        ref.add({
          data: {
            id: `${edge.from}_${edge.to}`,
            source: edge.from,
            target: edge.to,
          },
        });
      }
    });
    ref.resize();
    ref.layout({ name: "fcose" }).run();
  };
  const apiCall = async () => {
    if (request.actor === "") {
      alert("No Actor name provided");
      return;
    }
    if (request.number < 1) {
      alert("Number value should be greater than 1");
      return;
    }
    try {
      const { data } = await axios.get("http://localhost:4000", {
        params: request,
      });
      renderGraph(myCyRef, data);
    } catch (error) {
      console.log("ERROR", error);
    }
  };

  const getMovies = async (e) => {
    console.log(e);
    const actor = e.target.data().id;
    const { data } = await axios.get("http://localhost:4000/getMovies", {
      params: { actor },
    });
    data.forEach((node) => {
      if (myCyRef.getElementById(node.name).length === 0) {
        myCyRef.add({
          data: {
            group: node.label,
            id: node.name,
            color: NODE_COLORS[node.label],
          },
        });
      }
      if (myCyRef.getElementById(`${actor}_${node.name}`).length === 0) {
        myCyRef.add({
          data: {
            id: `${actor}_${node.name}`,
            source: actor,
            target: node.name,
          },
        });
      }
    });
    myCyRef.layout({ name: "fcose" }).run();
  };
  const getActors = async (e) => {
    const movie = e.target.data().id;
    const { data } = await axios.get("http://localhost:4000/getActors", {
      params: { movie },
    });
    data.forEach((node) => {
      if (myCyRef.getElementById(node.name).length === 0) {
        myCyRef.add({
          data: {
            group: node.label,
            id: node.name,
            color: NODE_COLORS[node.label],
          },
        });
      }
      if (myCyRef.getElementById(`${node.name}_${movie}`).length === 0) {
        myCyRef.add({
          data: {
            id: `${node.name}_${movie}`,
            source: node.name,
            target: movie,
          },
        });
      }
    });
    myCyRef.layout({ name: "fcose" }).run();
  };

  var contextOptions = {
    evtType: "cxttap",
    menuItems: [
      {
        id: "show_actors",
        content: "Show Actors",
        tooltipText: "remove",
        selector: "node",
        onClickFunction: getActors,
        show: true,
        hasTrailingDivider: true,
      },
      {
        id: "show_movies",
        content: "Show Movie",
        tooltipText: "remove",
        selector: "node",
        onClickFunction: getMovies,
        show: true,
        hasTrailingDivider: true,
      },
    ],
  };

  useEffect(() => {
    myCyRef.contextMenus(contextOptions);
  }, []);
  return (
    <div className="App">
      <h1>Hello How are you</h1>
      <input
        name="actor"
        value={request.actor}
        onChange={(e) =>
          setRequest({
            ...request,
            actor: e.target.value,
          })
        }
      />
      <input
        name="number"
        type="number"
        value={request.number}
        onChange={(e) =>
          setRequest({
            ...request,
            number: e.target.value,
          })
        }
      />
      <button onClick={apiCall}>Make API Call</button>
      <CytoscapeComponent
        style={{
          width: "100%",
          height: "1024px",
          borderColor: "black",
          borderWidth: "2px",
          borderBlockStyle: "double",
        }}
        cy={(cy) => (myCyRef = cy)}
        elements={[]}
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
        // userZoomingEnabled={false}
      />
    </div>
  );
}

export default App;
