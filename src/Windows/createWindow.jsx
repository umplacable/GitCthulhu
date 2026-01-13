import React from "react";
import MergeConflictPanel from "./MergeConflictPanel";
import Status from "../Components/Status.jsx";
import GitCommitList from "../Components/GitCommitList.jsx";
import GitSimpleAction from "../Components/GitSimpleAction.jsx";
import GitCommitAction from "../Components/GitCommitAction.jsx";
import GitBranchList from "../Components/GitBranchList.jsx";
import GitAddBranchAction from "../Components/GitAddBranchAction.jsx";
import GitDelBranch from "../Components/GitDelBranch.jsx";

// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function CreateWindow() {
  const [diffMode, setDiffMode] = React.useState(false);

  const toggleDiffMode = () => {
    setDiffMode((prev) => !prev);
  };

  return (
    <>
      <div id="barre_de_taches">
        <nav class="GitCthulhu">
          <ul>
            <li>
              <a href="#" class="secondary">
                ...
              </a>
            </li>
          </ul>
          <ul>
            <li>
              <a
                href="#"
                onClick={() => {
                  openTerminal();
                }}
              >
                Terminal
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="GitCthulhuLeft">
        <div>
          <h4>Les actions</h4>
        </div>

        <ul class="GitList GitAction">
          <h5>Common actions</h5>
          <GitSimpleAction
            nom="Pull"
            action={window.electronAPI.gitActions.pull}
          />
          <GitSimpleAction
            nom="Push"
            action={window.electronAPI.gitActions.push}
          />

          <GitCommitAction
            nom="Commit"
            action={window.electronAPI.gitActions.commit}
          />

          <h5>Branches</h5>
          <GitBranchList
            nom="Checkout"
            action={window.electronAPI.gitActions.branch}
          />
          <GitAddBranchAction
            nom="Add"
            action={window.electronAPI.gitActions.branch}
          />
          <GitDelBranch
            nom="Delete"
            action={window.electronAPI.gitActions.branch}
          />

          <h5>Commits</h5>

          {/* Bouton Merge */}
          <GitSimpleAction
            nom="Merge"
            action={async () => {
              const branch = window.prompt(
                "Nom de la branche à fusionner dans la branche courante ?"
              );
              if (!branch) return;

              try {
                const res = await window.electronAPI.gitActions.merge(branch);
                console.log("Résultat du merge :", res);

                if (!res || !res.ok) {
                  const msg =
                    res?.error ||
                    "Merge terminé avec des conflits (voir le panneau de conflits).";
                  alert("Merge : " + msg);
                } else {
                  alert("Merge terminé avec succès.");
                }
              } catch (e) {
                alert(
                  "Erreur lors du merge : " + (e.message || e.toString())
                );
              }
            }}
          />

          {/* Toggle du mode diff */}
          <li
            className={`GitCthulhu ${diffMode ? "GitDiffActive" : ""}`}
            onClick={toggleDiffMode}
          >
            Diff
          </li>
        </ul>
      </div>

      <div class="GitCthulhuSideshow">
        <GitCommitList diffMode={diffMode} />

        {/* Panneau de résolution de conflits de merge */}
        <MergeConflictPanel />
      </div>

      <div class="GitCthulhuFoot">
        <Status />
        <div class="mainOperations">
          <button
            class="secondary"
            onClick={() => window.electronAPI.closeWindow()}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}

function openTerminal(path) {
  window.electronAPI.openTerminal(path);
}

function afficheMessage(importance, titre, message) {
  // affichera un message avec un logo diférent selon l'importance
  console.log(titre);
  console.log(message);
}
