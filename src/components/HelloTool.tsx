import React, { useState } from "react";
import { Card } from "./Card";
import { Input } from "./Input";
import { Button } from "./Button";
import { ResultBox } from "./ResultBox";

export interface HelloToolProps {
  loaded: boolean;
  mcp_tools: {
    hello: (params: { submitter: string; title: string }) => string | undefined;
  };
}

export const HelloTool: React.FC<HelloToolProps> = ({ loaded, mcp_tools }) => {
  const [helloName, setHelloName] = useState("Alice");
  const [helloTitle, setHelloTitle] = useState("Hi");
  const [helloResult, setHelloResult] = useState<string | undefined>(undefined);

  const callHello = () => {
    if (!loaded) return;
    const result = mcp_tools.hello({ submitter: helloName, title: helloTitle });
    setHelloResult(result);
  };

  return (
    <Card title="Hello Tool">
      <div className="wasm-demo-tool-fields">
        <Input
          label="Submitter:"
          value={helloName}
          onChange={(e) => setHelloName(e.target.value)}
        />
        <Input
          label="Title:"
          value={helloTitle}
          onChange={(e) => setHelloTitle(e.target.value)}
        />
        <Button onClick={callHello}>Call Hello</Button>
        <ResultBox value={helloResult} />
      </div>
    </Card>
  );
};
