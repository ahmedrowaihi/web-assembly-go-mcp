import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...rest }) => (
  <button className="wasm-demo-tool-button" {...rest}>
    {children}
  </button>
);
