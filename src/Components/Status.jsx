import React, { useEffect, useState } from "react";

function Status() {
  const [gitStatus, setGitStatus] = useState({});
  const [currentBranch, setCurrentBranch] = useState("?");
  const [ahead, setAhead] = useState(0);
  const [behind, setBehind] = useState(0);
  const [got, setGot] = useState(false);
  const [interval, setStatusInterval] = useState(null);
  const [status, setStatus] = useState("Waiting for status ...");

  useEffect(async () => {
    // à chaque changement de dépôt sélectionné, on met à jour le status
    await window.electronAPI.gitActions.status().then((status) => {
      console.log(status);
      setGitStatus(status);
      setCurrentBranch(status.current);
      setAhead(status.ahead);
      setBehind(status.behind);
      setGot(true);
    });

    // Démarre l’intervalle d’actualisation
    setStatusInterval(
      setInterval(async () => {
        // à chaque changement de dépôt sélectionné, on met à jour le status
        await window.electronAPI.gitActions.status().then((s) => {
          setGitStatus(s);
          setCurrentBranch(s.current);
          setAhead(s.ahead);
          setBehind(s.behind);
        });
      }, 1000),
    ); // toutes les secondes

    return () => {
      // Nettoie l’intervalle pour éviter les fuites mémoire
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log(currentBranch);
    if (got) {
      if (gitStatus != null) {
        if (ahead == behind) {
          setStatus(`🟢 Up to date - Branch : ${currentBranch}`);
        } else if (ahead > behind) {
          setStatus(
            `🔵 Ahead by ${ahead} commit(s) - Branch : ${currentBranch}`,
          );
        } else if (behind > ahead) {
          setStatus(
            `🟠 Behind by ${behind} commit(s) - Branch : ${currentBranch}`,
          );
        }
      } else {
        setStatus("🔴 Could not get the status");
      }
    } else {
      setStatus("Waiting for status ...");
    }
  }, [got, gitStatus, currentBranch, ahead, behind]);

  return (
    <span
      aria-busy={!got}
      class="status"
      onClick={async () => {
        setGot(false);
        await window.electronAPI.gitActions.fetch().finally(() => {
          setGot(true);
        });
      }}
    >
      {status}
    </span>
  );
}

export default Status;
