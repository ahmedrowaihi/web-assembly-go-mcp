import "./App.css";
import { CalculateTool } from "./components/CalculateTool";
import { FetchDataTool } from "./components/FetchDataTool";
import { HelloTool } from "./components/HelloTool";
import useWasmMCP from "./useWasmMCP";

function App() {
  const { loaded, mcp_tools } = useWasmMCP();

  return (
    <div className="App wasm-demo-main">
      <h1 className="wasm-demo-title">Go MCP WASM Demo</h1>
      <p className="wasm-demo-desc">
        Interact with Go-powered MCP tools running in your browser via
        WebAssembly.
      </p>
      {!loaded && <p>Loading WASM...</p>}
      {loaded && (
        <div className="wasm-demo-tools">
          <HelloTool loaded={loaded} mcp_tools={mcp_tools} />
          <CalculateTool loaded={loaded} mcp_tools={mcp_tools} />
          <FetchDataTool loaded={loaded} mcp_tools={mcp_tools} />
        </div>
      )}
    </div>
  );
}

export default App;
