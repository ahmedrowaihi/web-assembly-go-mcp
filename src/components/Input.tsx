import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}) => (
  <label className="wasm-demo-tool-label">
    <span>{label}</span>
    <input
      className="wasm-demo-tool-input"
      type={type}
      value={value}
      onChange={onChange}
      {...rest}
    />
  </label>
);
