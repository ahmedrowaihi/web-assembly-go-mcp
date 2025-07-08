import { useEffect, useState, useRef } from "react";
import "./App.css";

interface GoWasmInstance {
  importObject: WebAssembly.Imports;
  run(instance: WebAssembly.Instance): void;
}

declare global {
  interface Window {
    Go: new () => GoWasmInstance;
    handleMCPRequest: (request: string) => string;
  }
}

function App() {
  const [wasmLoaded, setWasmLoaded] = useState(false);
  const [helloName, setHelloName] = useState("Alice");
  const [helloTitle, setHelloTitle] = useState("Hi");
  const [helloResult, setHelloResult] = useState<string | null>(null);
  const [calcA, setCalcA] = useState(2);
  const [calcB, setCalcB] = useState(3);
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchUrl, setFetchUrl] = useState(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  const wasmLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (wasmLoadedRef.current) return;
      // Load Go WASM
      const go = new window.Go();
      const wasm = await WebAssembly.instantiateStreaming(
        fetch("hello_mcp_go.wasm"),
        go.importObject
      );
      go.run(wasm.instance);
      setWasmLoaded(true);
      wasmLoadedRef.current = true;
    })();
  }, []);

  const callHello = () => {
    if (!wasmLoaded) return;
    const helloReq = {
      method: "hello",
      params: { submitter: helloName, content: { title: helloTitle } },
      id: 1,
    };
    const helloResp = window.handleMCPRequest(JSON.stringify(helloReq));
    setHelloResult(helloResp);
  };

  const callCalculate = () => {
    if (!wasmLoaded) return;
    const calcReq = {
      method: "calculate",
      params: { a: calcA, b: calcB },
      id: 2,
    };
    const calcResp = window.handleMCPRequest(JSON.stringify(calcReq));
    setCalcResult(calcResp);
  };

  const callFetchData = async () => {
    if (!wasmLoaded) return;
    setFetchLoading(true);
    setFetchResult(null);
    const fetchReq = {
      method: "fetch_data",
      params: { url: fetchUrl },
      id: 3,
    };
    const fetchResp: unknown = window.handleMCPRequest(
      JSON.stringify(fetchReq)
    );
    function isPromise(obj: unknown): obj is Promise<unknown> {
      return !!obj && typeof (obj as { then?: unknown }).then === "function";
    }
    if (isPromise(fetchResp)) {
      setFetchResult(String(await fetchResp));
    } else {
      setFetchResult(String(fetchResp));
    }
    setFetchLoading(false);
  };

  return (
    <div className="App wasm-demo-main">
      <h1 className="wasm-demo-title">Go MCP WASM Demo</h1>
      <p className="wasm-demo-desc">
        Interact with Go-powered MCP tools running in your browser via
        WebAssembly.
      </p>
      {!wasmLoaded && <p>Loading WASM...</p>}
      {wasmLoaded && (
        <div className="wasm-demo-tools">
          {/* Hello Tool Card */}
          <section className="card wasm-demo-card">
            <h2 className="wasm-demo-tool-header">Hello Tool</h2>
            <div className="wasm-demo-tool-fields">
              <label className="wasm-demo-tool-label">
                <span>Submitter:</span>
                <input
                  className="wasm-demo-tool-input"
                  type="text"
                  value={helloName}
                  onChange={(e) => setHelloName(e.target.value)}
                />
              </label>
              <label className="wasm-demo-tool-label">
                <span>Title:</span>
                <input
                  className="wasm-demo-tool-input"
                  type="text"
                  value={helloTitle}
                  onChange={(e) => setHelloTitle(e.target.value)}
                />
              </label>
              <button className="wasm-demo-tool-button" onClick={callHello}>
                Call Hello
              </button>
              <pre className="wasm-demo-tool-output">{helloResult}</pre>
            </div>
          </section>
          {/* Calculate Tool Card */}
          <section className="card wasm-demo-card">
            <h2 className="wasm-demo-tool-header">Calculate Tool</h2>
            <div className="wasm-demo-tool-fields">
              <label className="wasm-demo-tool-label">
                <span>A:</span>
                <input
                  className="wasm-demo-tool-input"
                  type="number"
                  value={calcA}
                  onChange={(e) => setCalcA(Number(e.target.value))}
                />
              </label>
              <label className="wasm-demo-tool-label">
                <span>B:</span>
                <input
                  className="wasm-demo-tool-input"
                  type="number"
                  value={calcB}
                  onChange={(e) => setCalcB(Number(e.target.value))}
                />
              </label>
              <button className="wasm-demo-tool-button" onClick={callCalculate}>
                Call Calculate
              </button>
              <pre className="wasm-demo-tool-output">{calcResult}</pre>
            </div>
          </section>
          {/* Fetch Data Tool Card */}
          <section className="card wasm-demo-card">
            <h2 className="wasm-demo-tool-header">Fetch Data Tool</h2>
            <div className="wasm-demo-tool-fields">
              <label className="wasm-demo-tool-label">
                <span>URL:</span>
                <input
                  className="wasm-demo-tool-input"
                  type="text"
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                />
              </label>
              <button
                className="wasm-demo-tool-button"
                onClick={() => callFetchData()}
                disabled={fetchLoading}
              >
                {fetchLoading ? "Fetching..." : "Fetch Example Data"}
              </button>
              <pre className="wasm-demo-tool-output">{fetchResult}</pre>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
