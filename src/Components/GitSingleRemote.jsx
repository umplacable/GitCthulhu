import React, { use, useEffect, useRef, useState } from "react";

export const GitSingleRemote = (props) => {
  const nameInputRef = useRef(null);
  const urlInputRef = useRef(null);

  console.log(props);
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
        disabled={props.disabled}
      />
      <b>:</b>
      <input
        type="text"
        placeholder="Url du remote"
        defaultValue={props.remote.refs.fetch}
        ref={urlInputRef}
        disabled={props.disabled}
      />
      {props.disabled ? (
        <button
          className="outline secondary"
          onClick={async () => {
            await window.electronAPI.gitActions.del_remote(props.remote.name);
            console.log("Remote supprimé:", props.remote.name);
            props.ReloadRemotes();
          }}
        >
          🗑️
        </button>
      ) : (
        <button
          className="outline secondary"
          onClick={async () => {
            await window.electronAPI.gitActions.add_remote(
              nameInputRef.current.value,
              urlInputRef.current.value,
            );
            props.ReloadRemotes();
          }}
        >
          ✅
        </button>
      )}
    </li>
  );
};
