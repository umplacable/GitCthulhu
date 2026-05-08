import React, { use, useEffect, useRef, useState } from "react";

export const GitSingleRemote = (props) => {
  const nameInputRef = useRef(null);
  const urlInputRef = useRef(null);

  return (
    <li
      style={{
        display: "flex",
        "flex-direction": "row",
        "align-items": "center",
        gap: "15px",
      }}
    >
      <input
        type="text"
        size="10"
        placeholder="Nom du remote"
        defaultValue={props.remote.name}
        style={{
          width: "auto",
        }}
        ref={nameInputRef}
      />
      <b>:</b>
      <input
        type="text"
        placeholder="Url du remote"
        defaultValue={props.remote.refs.fetch}
        ref={urlInputRef}
      />
      <a
        className="secondary"
        onClick={() => {
          nameInputRef.current.value = "";
          urlInputRef.current.value = "";
          props.removeRemotes(props.index);
        }}
      >
        🗑️
      </a>
    </li>
  );
};
