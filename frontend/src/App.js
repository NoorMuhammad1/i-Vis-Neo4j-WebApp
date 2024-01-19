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

  const runLayout = () => {
    myCyRef
      .layout({
        name: "fcose",
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: (node) => 100000,
        // Ideal edge (non nested) length
        idealEdgeLength: (edge) => 100,
      })
      .run();
  };
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
    runLayout();
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
    runLayout();
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
    runLayout();
  };

  var contextOptions = {
    evtType: "cxttap",
    menuItems: [
      {
        id: "actors",
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

  const getImage = (ele) => {
    const { group } = ele.data();
    if (group === "Person")
      return "data:image/png;base64,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";
    else {
      return `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISDxUQEBIQFRAPFRANDxAQFxUVEA8QFhEYFhYVFxUYHSggGBooGxcXIjEhJSktLi4uFx8zOzYsNygtLisBCgoKCg0NGg8ODisZFRkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABwEDBAUGCAL/xABKEAABAwIBBggJCQcDBQEAAAABAAIDBBESBQYhMUFRBxMUMlRhkZMiU3GBobHR0tMIFRYXI0JScpIkNENiY3OygqLBRLPC4fAz/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJxREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERY89dEznyMb1FwB7EGQi1E+cdO37xd1NafWbBZdHlBkrBIwgtPaDtBGwoMxFYNQFi1spc0gEjyG3qQZ8kgaLuIA3k2CxGZXp3OwNqIC7VhEjC7suoiztnlpn+Hd8bzZkjtJa78LifQVwWU8p4tdkHqdFBnBLn5KyqZQVD3PgnPFwF5uYJbeC0E6cLubbYS21tKnNAREQEREBERAREQEREBEWtrMuwRmxdcjWGC9vPq9KDZIuTq8+Im82Mn8zgPQLq7kDO1lS4xusyUXLWjU9u2xO0bv8A3YOnVHOA1kDyrEdUDrVuScEW0IKz5Zp2c6VujQQ27rH/AE3WvnzsgbqD3dgHpN/QuRzxybILzQXxjnMGqRu7827s8kbzZccdp8+i3Ugn7JOXWVAOEgObzmayBsN9oWaagbyvOVDnFLBK2aJ1nsN9OkOG1rhtBU0ZuZejrqcTRaHDwZY73dFJbS07xuO0diDfzyhwIUa5308tOXTw3LNc0Y2D8bR6x5967rGVj1sAe1BDU2cTj97R1LLzcz1kpZ8Ru+F9hNHtI/E3+YenV1jEz1zZNK8zRD9ncfDaP4LidY/kPoPVa3MXQelKerZLG2aJwdHIA9jm6iD/APalXjVD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iGKWQt0uETHPLRvOEGyxLrbZDzkqKMPFOWDjcOMPaXDwb2IsQfvFB8nIVX0Wq7mT3VT5jqui1XdSexbF+fdcdJdD5mv99fBz3rfxRfpf76DXTZJqGNL309Q1rdLnOjeGtG8kjQsFxW5qs7qyRjo3PZhkaWOwtdfCRY63EalpCUGPKph+TvzK381L6pVDspUxfJ25lb+al9UqCYkREBERAREQEREBERBqs6nWoag7oZT/ALSvPuW6oOfcL0blWjE1PLA42E0ckJO4OaW39K8vZZikhmfBKMMkTjG9p2EbuoixB2ggoLckqx3vVl0qtuegul6+C5WS9UL0F7EqYlZxqmNBfxJiVjEmNBfxJiVjGmNBfxJiWPjTGgyMSYlj40xoMjEhcsbGhegrI5TL8nTmVv5qX1SqE3vXojgLyA+myc6aUFsla8TtadBEDW4Y7+XwneRwQSQiIgIiICIiAiIgIiILc2pcVnhmdTV+mVrmTNGFs8VhJbY11wQ4dR1XNrLuVbdCCggyXgekv4Na22y8BvbzSq0eB+XprO4d8VTtyZqpyVu5BBB4H5emM7h3xF8nggl6YzuD8RTzyRu5U5G3cggb6oJemM7g/EVPqhl6YzuT8RTzyJqciaggb6oZemM7k/ET6oZemM7k/EU8chYnIWoIG+qGXpjO5PxFX6oJemM7k/EU8chaq8haggb6n5emM7k/EVfqel6YzuT8RTxyJqryNqCCBwOy9MZ3B+Iqjgbl6azuD8RTvyRu5V5M3cggkcDEvTWdw74i+hwKydOZ3B+Kp15O3cq8SNyCKs2OCOlp5BLUvdVPacTWvaGQA7CY7ku85I6lKMCuiIL6AQVREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERB//9k=`;
    }
  };

  useEffect(() => {
    myCyRef.contextMenus(contextOptions);
  }, []);
  return (
    <div className="App">
      <div id="input_menu">
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
      </div>
      <CytoscapeComponent
        style={{
          width: "100%",
          height: "1024px",
          border: "2px solid rgba(0, 0, 0)",
        }}
        cy={(cy) => (myCyRef = cy)}
        elements={[]}
        stylesheet={[
          {
            selector: "node",
            style: {
              "background-image": (ele) => {
                return getImage(ele);
              },
              "font-size": "12px",
              "background-fit": "cover",
              "background-color": "data(color)",
              label: "data(id)",
            },
          },
          {
            selector: "edge",
            style: {
              "line-color": "#95a5a6",
              label: "ACTED IN",
              "font-size": "10px",
              "target-arrow-color": "#ccc",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
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
