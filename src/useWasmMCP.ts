import { useEffect, useRef, useState } from "react";

interface UseWasmMCPResult {
  loaded: boolean;
  mcp_tools: {
    hello: (params: { submitter: string; title: string }) => string | undefined;
    calculate: (params: { a: number; b: number }) => string | undefined;
    fetchData: (params: { url: string }) => Promise<string | undefined>;
  };
}

function useWasmMCP(): UseWasmMCPResult {
  const [loaded, setLoaded] = useState(false);
  const wasmLoadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (wasmLoadedRef.current) return;
      const GoClassUnknown = (window as unknown as { Go?: unknown }).Go;
      if (typeof GoClassUnknown !== "function") return;
      const go = new (GoClassUnknown as new () => { importObject: WebAssembly.Imports; run(instance: WebAssembly.Instance): void })();
      const wasm = await WebAssembly.instantiateStreaming(
        fetch("hello_mcp_go.wasm"),
        go.importObject
      );
      go.run(wasm.instance);
      setLoaded(true);
      wasmLoadedRef.current = true;
    })();
  }, []);

  const getHandleMCPRequest = () => {
    const handleMCPRequestUnknown = (window as unknown as { handleMCPRequest?: unknown }).handleMCPRequest;
    if (typeof handleMCPRequestUnknown !== "function") return undefined;
    return handleMCPRequestUnknown as (req: string) => unknown;
  };

  const hello = (params: { submitter: string; title: string }): string | undefined => {
    if (!loaded) return undefined;
    const handleMCPRequest = getHandleMCPRequest();
    if (!handleMCPRequest) return undefined;
    const req = {
      method: "hello",
      params: { submitter: params.submitter, content: { title: params.title } },
      id: 1,
    };
    return handleMCPRequest(JSON.stringify(req)) as string;
  };

  const calculate = (params: { a: number; b: number }): string | undefined => {
    if (!loaded) return undefined;
    const handleMCPRequest = getHandleMCPRequest();
    if (!handleMCPRequest) return undefined;
    const req = {
      method: "calculate",
      params: { a: params.a, b: params.b },
      id: 2,
    };
    return handleMCPRequest(JSON.stringify(req)) as string;
  };

  const fetchData = async (params: { url: string }): Promise<string | undefined> => {
    if (!loaded) return undefined;
    const handleMCPRequest = getHandleMCPRequest();
    if (!handleMCPRequest) return undefined;
    const req = {
      method: "fetch_data",
      params: { url: params.url },
      id: 3,
    };
    const resp: unknown = handleMCPRequest(JSON.stringify(req));
    function isPromise(obj: unknown): obj is Promise<unknown> {
      return !!obj && typeof (obj as { then?: unknown }).then === "function";
    }
    if (isPromise(resp)) {
      return String(await resp);
    } else {
      return String(resp);
    }
  };

  return {
    loaded,
    mcp_tools: {
      hello,
      calculate,
      fetchData,
    },
  };
}

export default useWasmMCP; 