import React, { useState } from "react";

type Props = {
  title: string;
  headerExtra?: React.ReactNode; // 👈 new prop for MC or status
  children: React.ReactNode;
};

export default function CollapseSection({ title, headerExtra, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="deg-req-wrapper">
      <div className="deg-req-header">
        <h2 className="deg-req-title">{title}</h2>
        
      </div>

      <div className = "container">
      <button
        className="deg-req-toggle"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        {collapsed ? "Show Details ▾" : "Hide Details ▴"}
      </button>
      {headerExtra && <div className="deg-req-mc">{headerExtra}</div>}
      </div>

      {!collapsed && <div>{children}</div>}
    </div>
  );
}
