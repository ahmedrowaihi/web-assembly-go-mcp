import React, { useState } from "react";
import { Card } from "./base/Card";
import { Input } from "./base/Input";
import { Button } from "./base/Button";
import { ResultBox } from "./base/ResultBox";

export interface CalculateToolProps {
  loaded: boolean;
  mcp_tools: {
    calculate: (params: { a: number; b: number }) => string | undefined;
  };
}

export const CalculateTool: React.FC<CalculateToolProps> = ({
  loaded,
  mcp_tools,
}) => {
  const [calcA, setCalcA] = useState(2);
  const [calcB, setCalcB] = useState(3);
  const [calcResult, setCalcResult] = useState<string | undefined>(undefined);

  const callCalculate = () => {
    if (!loaded) return;
    const result = mcp_tools.calculate({ a: calcA, b: calcB });
    setCalcResult(result);
  };

  return (
    <Card title="Calculate Tool">
      <div className="wasm-demo-tool-fields">
        <Input
          label="A:"
          type="number"
          value={calcA}
          onChange={(e) => setCalcA(Number(e.target.value))}
        />
        <Input
          label="B:"
          type="number"
          value={calcB}
          onChange={(e) => setCalcB(Number(e.target.value))}
        />
        <Button onClick={callCalculate}>Call Calculate</Button>
        <ResultBox value={calcResult} />
      </div>
    </Card>
  );
};
