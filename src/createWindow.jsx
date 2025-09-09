import React from "react";

export default function CreateWindow() {
  return (<>
        <h1>Hello from Electron renderer!</h1>
        <p>👋</p>
        <button onClick={() => window.electronAPI.openSelectWindow()}>
        Ouvrir une nouvelle fenêtre
        </button>

        <button onClick={() => window.electronAPI.closeWindow()}>
          Fermer la fenêtre
        </button>
      </>);
}