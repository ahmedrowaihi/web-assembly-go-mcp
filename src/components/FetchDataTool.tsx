import React, { useState } from "react";
import { Card } from "./Card";
import { Input } from "./Input";
import { Button } from "./Button";
import { ResultBox } from "./ResultBox";

export interface FetchDataToolProps {
  loaded: boolean;
  mcp_tools: {
    fetchData: (params: { url: string }) => Promise<string | undefined>;
  };
}

export const FetchDataTool: React.FC<FetchDataToolProps> = ({
  loaded,
  mcp_tools,
}) => {
  const [fetchUrl, setFetchUrl] = useState(
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  const [fetchResult, setFetchResult] = useState<string | undefined>(undefined);
  const [fetchLoading, setFetchLoading] = useState(false);

  const callFetchData = async () => {
    if (!loaded) return;
    setFetchLoading(true);
    setFetchResult(undefined);
    const result = await mcp_tools.fetchData({ url: fetchUrl });
    setFetchResult(result);
    setFetchLoading(false);
  };

  return (
    <Card title="Fetch Data Tool">
      <div className="wasm-demo-tool-fields">
        <Input
          label="URL:"
          value={fetchUrl}
          onChange={(e) => setFetchUrl(e.target.value)}
        />
        <Button onClick={callFetchData} disabled={fetchLoading}>
          {fetchLoading ? "Fetching..." : "Fetch Example Data"}
        </Button>
        <ResultBox value={fetchResult} />
      </div>
    </Card>
  );
};
