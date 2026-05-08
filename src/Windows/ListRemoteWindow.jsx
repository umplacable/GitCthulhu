import React, { use, useEffect, useState } from "react";
import { GitSingleRemote } from "../Components/GitSingleRemote.jsx";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function ListRemoteWindow() {
  const [remotes, setRemotes] = useState([]);
  const [newRemotes, setNewRemotes] = useState([]);
  const [nbMoreRemotes, setNbMoreRemotes] = useState(0);

  useEffect(() => {
    const fetchRemotes = async () => {
      try {
        const remotesList = await window.electronAPI.gitActions.list_remotes();
        setRemotes(remotesList);
        setNewRemotes(remotesList);
        console.log(newRemotes);
      } catch (error) {
        console.error("Erreur lors de la récupération des remotes :", error);
      }
    };
    fetchRemotes();
  }, []);

  const addnbRemotes = () => {
    setNbMoreRemotes((prev) => {
      prev + 1;
      console.log(prev);
      return prev + 1;
    });
    let tempsRemotes = newRemotes;
    tempsRemotes.push({ name: "", refs: { fetch: "" } });
    setNewRemotes(tempsRemotes);

    console.log(newRemotes);
  };

  const removeRemotes = (id) => {
    if (newRemotes.length > 0) {
      let tempsRemotes = newRemotes;
      tempsRemotes = [
        ...tempsRemotes.slice(0, id),
        ...tempsRemotes.slice(id + 1),
      ];
      setNewRemotes(tempsRemotes);
      console.log(id);
      console.log(tempsRemotes);
    }
  };

  return (
    <>
      <div
        style={{
          margin: "10px",
        }}
      >
        <h1 style={{ "text-align": "center" }}>Remotes</h1>
        <ul style={{ "padding-left": "0px" }}>
          {newRemotes.map((remote, index) => (
            <GitSingleRemote
              index={index}
              remote={remote}
              removeRemotes={removeRemotes}
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
