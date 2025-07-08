import React from "react";

export interface CardProps {
  title?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <section className="card wasm-demo-card">
    {title && <h2 className="wasm-demo-tool-header">{title}</h2>}
    {children}
  </section>
);
