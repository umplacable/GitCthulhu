import React, { use, useEffect, useState } from "react";
import { GitSingleRemote } from "../Components/GitSingleRemote.jsx";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function GitConfigWindow() {
  const [remotes, setRemotes] = useState([]);
  const [newRemotes, setNewRemotes] = useState([]);
  const [nbMoreRemotes, setNbMoreRemotes] = useState(0);
  const [reload, setReload] = useState(true);

  useEffect(() => {
    if (!reload) return;
    const fetchRemotes = async () => {
      try {
        const remotesList = await window.electronAPI.gitActions.list_remotes();
        setRemotes(remotesList);
        setNewRemotes(remotesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des remotes :", error);
      } finally {
        setReload(false);
      }
    };
    fetchRemotes();
  }, [reload]);

  const ReloadRemotes = async () => {
    window.location.reload(true);
  };

  const addnbRemotes = () => {
    setNbMoreRemotes((prev) => {
      prev + 1;
      return prev + 1;
    });
    let tempsRemotes = newRemotes;
    tempsRemotes.push({ name: "", refs: { fetch: "" } });
    setNewRemotes(tempsRemotes);
  };

  return (
    <>
      <div
        style={{
          margin: "10px",
        }}
      >
        <h1 style={{ "text-align": "center" }}>Config</h1>
        <ul style={{ "padding-left": "0px" }}>
          {newRemotes.map((remote, index) => (
            <GitSingleRemote
              index={index}
              remote={remote}
              ReloadRemotes={ReloadRemotes}
              disabled={remote.refs.fetch !== ""} // désactive les champs d'input si le remote existe déjà
            />
          ))}
        </ul>
        <button
          onClick={() => {
            addnbRemotes();
          }}
        >
          ➕
        </button>
      </div>
      <div class="GitCthulhuFoot">
        <p></p>
        <div class="mainOperations">
          <button
            class="secondary"
            onClick={() => window.electronAPI.closeWindow()}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
