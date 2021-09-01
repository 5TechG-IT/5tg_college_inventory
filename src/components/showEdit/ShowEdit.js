import "./style.css";
import React, { useState } from "react";

export const TextEdit = ({
  val,
  setVal,
  show,
  toggle,
  style = {},
  showOnly = false,
}) => {
  if (show || showOnly) {
    return (
      <div
        className={showOnly ? "fws1" : "fws"}
        onClick={(e) => (showOnly ? "" : toggle(false))}
        style={style}
      >
        {val}
      </div>
    );
  }
  return (
    <input
      type="text"
      value={val}
      className="fwi"
      onChange={(e) => setVal(e.target.value)}
      onBlur={(e) => toggle(true)}
      autoFocus
      style={style}
    />
  );
};
