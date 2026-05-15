import React, { useEffect, useState } from "react";

function Status() {
  const [gitStatus, setGitStatus] = useState({});
  const [got, setGot] = useState(false);
  const [interval, setInterval] = useState(null);
  const [status, setStatus] = useState("Waiting for status ...");

  useEffect(async () => {
    // à chaque changement de dépôt sélectionné, on met à jour le status
    await window.electronAPI.gitActions.status().then((status) => {
      setGitStatus(status);
      setGot(true);
    });

    // Démarre l’intervalle d’actualisation
    setInterval(
      setInterval(async () => {
        // à chaque changement de dépôt sélectionné, on met à jour le status
        await window.electronAPI.gitActions.status().then((status) => {
          setGitStatus(status);
        });
      }, 1000),
    ); // toutes les secondes

    return () => {
      // Nettoie l’intervalle pour éviter les fuites mémoire
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (got) {
      if (gitStatus != null) {
        if (gitStatus.ahead == gitStatus.behind) {
          setStatus(`🟢 Up to date - Branch : ${gitStatus.current}`);
        } else if (gitStatus.ahead > gitStatus.behind) {
          setStatus(
            `🔵 Ahead by ${gitStatus.ahead} commit(s) - Branch : ${gitStatus.current}`,
          );
        } else if (gitStatus.behind > gitStatus.ahead) {
          setStatus(
            `🟠 Behind by ${gitStatus.behind} commit(s) - Branch : ${gitStatus.current}`,
          );
        }
      } else {
        setStatus("🔴 Could not get the status");
      }
    } else {
      setStatus("Waiting for status ...");
    }
  }, [got, gitStatus]);

  return (
    <span
      aria-busy={!got}
      class="status"
      onClick={async () => {
        setGot(false);
        await window.electronAPI.gitActions.fetch().then((result) => {
          setGot(true);
        });
      }}
    >
      {status}
    </span>
  );
}

export default Status;
