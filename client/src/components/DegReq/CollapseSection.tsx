import React, { useState } from "react";

type Props = {
  title: string;
  headerExtra?: React.ReactNode; // 👈 new prop for MC or status
  children: React.ReactNode;
};

export default function CollapseSection({ title, headerExtra, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className = "deg-req-card">
      <div className = "container deg-req-header">
        <h1 className="deg-req-title">{title}</h1>
        <button
          className="deg-req-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? "+" : "-"}
        </button>
        {headerExtra && <div className="right deg-req-mc">{headerExtra}</div>}
      </div>

      {!collapsed && <div className="deg-req-contents">{children}</div>}
    </div>
  );
}
