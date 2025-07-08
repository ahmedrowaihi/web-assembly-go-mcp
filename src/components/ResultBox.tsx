import React from "react";

export interface ResultBoxProps {
  children?: React.ReactNode;
  value?: string | undefined | null;
}

export const ResultBox: React.FC<ResultBoxProps> = ({ children, value }) => (
  <pre className="wasm-demo-tool-output">{children ?? value}</pre>
);
