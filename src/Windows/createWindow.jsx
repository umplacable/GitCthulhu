import { use } from "marked";
import React, { useEffect, useState } from "react";
import GitAddBranchAction from "../Components/GitAddBranchAction.jsx";
import GitBranchList from "../Components/GitBranchList.jsx";
import GitCommitAction from "../Components/GitCommitAction.jsx";
import GitCommitList from "../Components/GitCommitList.jsx";
import GitDelBranch from "../Components/GitDelBranch.jsx";
import GitMergeAction from "../Components/GitMergeAction.jsx";
import GitRebaseAction from "../Components/GitRebaseAction.jsx";
import GitSimpleAction from "../Components/GitSimpleAction.jsx";
import GitTopologie from "../Components/GitTopologie.jsx";
import Status from "../Components/Status.jsx";

// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function CreateWindow() {
  const [diffMode, setDiffMode] = useState(false);
  const [fileBurgerMenu, setFileBurgerMenu] = useState(false);
  const [file_submoduleBurgerMenu, setFile_submoduleBurgerMenu] =
    useState(false);
  const [editBurgerMenu, setEditBurgerMenu] = useState(false);
  const [edit_cleanBurgerMenu, setEdit_cleanBurgerMenu] = useState(false);
  const [sideshowContent, setSideshowContent] = useState("Commit"); // Commit || Topologie

  const toggleDiffMode = () => {
    setDiffMode((prev) => !prev);
  };

  const toggleFileBurgerMenu = () => {
    setFileBurgerMenu((prev) => !prev);
  };
  const toggleFile_submoduleBurgerMenu = () => {
    setFile_submoduleBurgerMenu((prev) => !prev);
  };
  const toggleEditBurgerMenu = () => {
    setEditBurgerMenu((prev) => !prev);
  };
  const toggleEdit_cleanBurgerMenu = () => {
    setEdit_cleanBurgerMenu((prev) => !prev);
  };

  const checkFetch = async () => {
    try {
      const result = await window.electronAPI.gitActions.fetch();
    } catch (error) {}
  };

  useEffect(async () => {
    checkFetch();
  }, []);

  useEffect(() => {
    if (diffMode) {
      setSideshowContent("Commit");
    }
  }, [diffMode]);

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
            <li
              onMouseEnter={() => {
                setFileBurgerMenu(true);
              }}
              onMouseLeave={() => {
                setFileBurgerMenu(false);
              }}
            >
              <a class="secondary" href="#">
                File
              </a>
              {fileBurgerMenu && (
                <ul className="BurgerMenu">
                  <li
                    onClick={() => {
                      window.electronAPI.openInitRepoWindow();
                    }}
                  >
                    Nouveau
                  </li>
                  <li
                    onClick={() => {
                      window.electronAPI.openSelectCreateRepoWindow();
                    }}
                  >
                    Ouvrir
                  </li>
                  <li
                    onClick={() => {
                      window.electronAPI.closeWindow();
                    }}
                  >
                    Fermer
                  </li>

                  <div style={{ width: "100%" }}>
                    <li
                      onClick={() => {
                        window.electronAPI.openListRemote();
                      }}
                    >
                      Remotes
                    </li>
                  </div>
                  <li
                    style={{ width: "100%", display: "flex" }}
                    onClick={() => {
                      toggleFile_submoduleBurgerMenu();
                    }}
                    onMouseLeave={() => {
                      setFile_submoduleBurgerMenu(false);
                    }}
                  >
                    <p style={{ width: "100%", "margin-bottom": "0px" }}>
                      Submodule
                    </p>
                    {fileBurgerMenu && file_submoduleBurgerMenu && (
                      <ul
                        style={{
                          "margin-left": "90%",
                          "min-width": "15em",
                        }}
                        className="BurgerMenu"
                      >
                        <li
                          onClick={() => {
                            window.electronAPI.gitActions.submodule("add");
                          }}
                        >
                          Add
                        </li>
                        <li
                          onClick={() => {
                            window.electronAPI.gitActions.submodule("update");
                          }}
                        >
                          Update
                        </li>
                        <li
                          onClick={() => {
                            window.electronAPI.gitActions.submodule("init");
                          }}
                        >
                          Init
                        </li>
                      </ul>
                    )}
                  </li>
                </ul>
              )}
            </li>
            <li
              onMouseEnter={() => {
                setEditBurgerMenu(true);
              }}
              onMouseLeave={() => {
                setEditBurgerMenu(false);
                setEdit_cleanBurgerMenu(false);
              }}
            >
              <a class="secondary" href="#" onClick={toggleEditBurgerMenu}>
                Edit
              </a>
              {editBurgerMenu && (
                <ul className="BurgerMenu">
                  <li
                    onClick={() => {
                      window.electronAPI.openConfig("local");
                    }}
                  >
                    Configuration locale
                  </li>

                  <div
                    style={{
                      width: "100%",
                    }}
                    onMouseLeave={() => {
                      setEdit_cleanBurgerMenu(false);
                    }}
                  >
                    <li
                      style={{ width: "100%", display: "flex" }}
                      onClick={() => {
                        toggleEdit_cleanBurgerMenu();
                      }}
                      onMouseLeave={() => {
                        setEdit_cleanBurgerMenu(false);
                      }}
                    >
                      <p style={{ width: "100%", "margin-bottom": "0px" }}>
                        Clean
                      </p>
                      {editBurgerMenu && edit_cleanBurgerMenu && (
                        <ul
                          style={{
                            "margin-left": "90%",
                            "min-width": "15em",
                          }}
                          className="BurgerMenu"
                        >
                          <li
                            onClick={() => {
                              window.electronAPI.gitActions.clean("");
                            }}
                          >
                            Untracked files
                          </li>
                          <li
                            onClick={() => {
                              window.electronAPI.gitActions.clean("d");
                            }}
                          >
                            Untracked files and directories
                          </li>
                          <li
                            onClick={() => {
                              window.electronAPI.gitActions.clean("X");
                            }}
                          >
                            Ignored files only
                          </li>
                          <li
                            onClick={() => {
                              window.electronAPI.gitActions.clean("x");
                            }}
                          >
                            All files
                          </li>
                          <li
                            onClick={() => {
                              window.electronAPI.gitActions.clean("xd");
                            }}
                          >
                            All files and directories
                          </li>
                        </ul>
                      )}
                    </li>
                    <li
                      onClick={() => {
                        window.electronAPI.gitActions.gc();
                      }}
                    >
                      Garbage collect
                    </li>

                    <li
                      onClick={() => {
                        window.electronAPI.gitActions.archive();
                      }}
                    >
                      Archive
                    </li>
                  </div>
                </ul>
              )}
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
          <GitMergeAction />
          <GitRebaseAction />

          <h5>Commits</h5>
          <li
            className={`GitCthulhu ${diffMode ? "GitDiffActive" : ""}`}
            onClick={toggleDiffMode}
          >
            Diff
          </li>
        </ul>
      </div>

      <div class="GitCthulhuSideshow">
        <nav
          style={{
            "justify-content": "flex-start",
            padding: "0.5em",
            "padding-bottom": "0",
            "border-bottom": "#304444 1px solid",
            position: "sticky",
            top: 0,
            zIndex: 5,
            "background-color": "#13171f",
          }}
        >
          <span
            onClick={() => {
              setSideshowContent("Commit");
            }}
            style={
              sideshowContent === "Commit"
                ? {
                    padding: "0.5em",
                    border: "#304444 1px solid",
                    "border-bottom": "#00000000 0px",
                    "border-radius": "5px",
                    margin: "0.5em",
                    marginBottom: "0px",
                    cursor: "pointer",
                  }
                : {
                    padding: "0.5em",
                    margin: "0.5em",
                    marginBottom: "0px",
                    cursor: "pointer",
                  }
            }
          >
            Commit
          </span>
          <span
            onClick={() => {
              if (!diffMode) {
                setSideshowContent("Topologie");
              }
            }}
            style={
              sideshowContent === "Topologie"
                ? {
                    padding: "0.5em",
                    border: "#304444 1px solid",
                    "border-bottom": "#00000000 0px",
                    "border-radius": "5px",
                    margin: "0.5em",
                    marginBottom: "0px",
                    cursor: "pointer",
                  }
                : {
                    padding: "0.5em",
                    margin: "0.5em",
                    marginBottom: "0px",
                    cursor: "pointer",
                  }
            }
          >
            Topologie
          </span>
        </nav>
        {sideshowContent === "Commit" ? (
          <GitCommitList diffMode={diffMode} />
        ) : sideshowContent === "Topologie" ? (
          <GitTopologie />
        ) : (
          ""
        )}
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
