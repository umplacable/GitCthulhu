import React, { useCallback, useEffect, useState } from "react";

function GitCommitList(props) {
  const [commits, setCommits] = useState([]); // liste des commits
  const [baseCommit, setBaseCommit] = useState(null); // 1er commit sélectionné
  const [compareCommit, setCompareCommit] = useState(null); // 2e commit sélectionné
  const [diffText, setDiffText] = useState(""); // diff brut complet
  const [showDiff, setShowDiff] = useState(false); // affiche ou non la fenêtre Diff
  const [showCommitShow, setShowCommitShow] = useState(false); // affiche ou non la fenêtre Show
  const [diffFiles, setDiffFiles] = useState([]); // liste des fichiers modifiés {file, text}
  const [selectedFile, setSelectedFile] = useState("__ALL__"); // fichier actuellement affiché ("__ALL__" = tous)
  const [selectedCommit, setSelectedCommit] = useState(null); // commit actuellement sélectionné pour le show
  const [selectedCommitShowText, setSelectedCommitShowText] = useState(""); // texte brut du show du commit sélectionné
  const [selectedCommitShowDiffFiles, setSelectedCommitShowDiffFiles] =
    useState([]); // liste des fichiers modifiés du show du commit sélectionné {file, text}

  const [burgerMenuCommit, setBurgerMenuCommit] = useState({});

  const parseDiffByFile = useCallback((diffTextInput) => {
    const lines = diffTextInput.split("\n");
    const files = [];
    let currentFile = null;
    let currentLines = [];

    const flush = () => {
      if (currentFile && currentLines.length > 0) {
        files.push({ file: currentFile, text: currentLines.join("\n") });
      }
    };

    for (let line of lines) {
      if (line.startsWith("diff --git ")) {
        flush();
        currentLines = [line];
        const match = line.match(/^diff --git a\/(.+?) b\/(.+)$/);
        currentFile = match ? match[2] : line;
      } else {
        if (!currentFile) {
          continue;
        }
        currentLines.push(line);
      }
    }

    flush();
    return files;
  }, []);

  useEffect(() => {
    const loadCommits = async () => {
      const ret = await window.electronAPI.gitActions.log();
      const fetchedCommits = ret.all.map((x) => x);

      fetchedCommits.forEach((commit) => {
        const dateCommit = new Date(Date.parse(commit.date));
        commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" });
      });

      setCommits(fetchedCommits);
    };

    loadCommits();

    const intervalId = setInterval(async () => {
      const ret = await window.electronAPI.gitActions.log();
      const fetchedCommits = ret.all.map((x) => x);

      fetchedCommits.forEach((commit) => {
        const dateCommit = new Date(Date.parse(commit.date));
        commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" });
      });

      setCommits(fetchedCommits);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!props.diffMode) {
      setBaseCommit(null);
      setCompareCommit(null);
      setDiffText("");
      setShowDiff(false);
      setDiffFiles([]);
      setSelectedFile("__ALL__");
    }
  }, [props.diffMode]);

  const handleRowClick = useCallback(
    async (commit) => {
      if (!props.diffMode) {
        return;
      }

      let newBase = baseCommit;
      let newCompare = compareCommit;

      if (!baseCommit && !compareCommit) {
        newBase = commit;
        newCompare = null;
      } else if (
        baseCommit &&
        !compareCommit &&
        baseCommit.hash === commit.hash
      ) {
        newBase = null;
        newCompare = null;
      } else if (
        baseCommit &&
        !compareCommit &&
        baseCommit.hash !== commit.hash
      ) {
        newCompare = commit;
      } else {
        newBase = commit;
        newCompare = null;
      }

      setBaseCommit(newBase);
      setCompareCommit(newCompare);
      setShowDiff(false);

      if (newBase && newCompare) {
        const diffTextResult = await window.electronAPI.gitActions.diff(
          newBase.hash,
          newCompare.hash,
        );
        const diffFilesResult = parseDiffByFile(diffTextResult);

        setDiffText(diffTextResult);
        setDiffFiles(diffFilesResult);
        setSelectedFile(
          diffFilesResult.length > 0 ? diffFilesResult[0].file : "__ALL__",
        );
        setShowDiff(true);
      }
    },
    [props.diffMode, baseCommit, compareCommit, parseDiffByFile],
  );

  const setBurgerMenu = (commitHash, state) => {
    let tempmenu = burgerMenuCommit;
    tempmenu[commitHash] = state;
    setBurgerMenuCommit(tempmenu);
  };

  let diffTextToShow = diffText;
  if (selectedFile && selectedFile !== "__ALL__") {
    const fileObj = diffFiles.find((f) => f.file === selectedFile);
    if (fileObj) {
      diffTextToShow = fileObj.text;
    }
  }

  return (
    <div className="GraphBranches">
      <table className="CommitList">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">User</th>
            <th scope="col">Message</th>
          </tr>
        </thead>

        <tbody>
          {commits.map((commit, index) => {
            const isBase = baseCommit && baseCommit.hash === commit.hash;
            const isCompare =
              compareCommit && compareCommit.hash === commit.hash;

            let rowClass = "";
            if (isBase) rowClass += " CommitRowBase";
            if (isCompare) rowClass += " CommitRowCompare";

            return (
              <tr
                key={commit.hash}
                className={rowClass}
                onClick={() => handleRowClick(commit)}
              >
                <td style={{ whiteSpace: "nowrap" }}>
                  {`Le ${commit.date.split(" ")[0]}`} <br />
                  {`à ${commit.date.split(" ")[1].split(":").slice(0, 2).join(":")}`}
                </td>
                <td>{commit.author_name}</td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "center",
                    }}
                  >
                    <span>{commit.message}</span>
                    <div
                      style={{
                        display: "flex",
                        "flex-direction": "row-reverse",
                      }}
                      onMouseLeave={() => setBurgerMenu(commit.hash, false)}
                    >
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setBurgerMenu(
                            commit.hash,
                            !burgerMenuCommit[commit.hash],
                          );
                        }}
                      >
                        ...
                      </button>

                      {burgerMenuCommit[commit.hash] && (
                        <ul
                          className="BurgerMenu"
                          style={{ "margin-right": "40px" }}
                        >
                          <li
                            onClick={(event) => {
                              event.stopPropagation();
                              window.electronAPI.gitActions
                                .show(commit.hash)
                                .then((data) => {
                                  setSelectedCommitShowText(data);
                                  setSelectedCommitShowDiffFiles(
                                    parseDiffByFile(data),
                                  );
                                  setSelectedCommit(commit);
                                  setShowCommitShow(true);
                                  console.log(data);
                                });
                            }}
                          >
                            Show
                          </li>
                          <li
                            onClick={(event) => {
                              event.stopPropagation();
                              window.electronAPI.gitActions.revert(commit.hash);
                            }}
                          >
                            Revert
                          </li>
                          <li
                            onClick={(event) => {
                              event.stopPropagation();
                              window.electronAPI.gitActions.chery_pick(
                                commit.hash,
                              );
                            }}
                          >
                            Cherry-pick
                          </li>
                          {index === 0 && (
                            <li
                              role="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                window.electronAPI.gitActions.ammend();
                                const element =
                                  document.getElementById("Commit");
                                element.innerText = "Commit ammend";

                                const TextArea =
                                  document.getElementById("CommitMessage");
                                TextArea.value = commit.message;
                                TextArea.classList.remove("Hiden");
                                TextArea.focus();
                              }}
                            >
                              Ammend
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showDiff && (
        <div className="DiffModal">
          <div className="DiffModalContent">
            <div className="DiffModalHeader">
              <span>
                Diff&nbsp;
                {baseCommit ? baseCommit.hash.substring(0, 7) : "?"}
                {" .. "}
                {compareCommit ? compareCommit.hash.substring(0, 7) : "?"}
              </span>

              {diffFiles.length > 0 && (
                <select
                  className="DiffFileSelector"
                  value={selectedFile || "__ALL__"}
                  onChange={(e) => setSelectedFile(e.target.value)}
                >
                  <option value="__ALL__">Tous les fichiers</option>
                  {diffFiles.map((file) => (
                    <option key={file.file} value={file.file}>
                      {file.file}
                    </option>
                  ))}
                </select>
              )}

              <button
                className="DiffCloseButton"
                onClick={() => setShowDiff(false)}
              >
                Fermer
              </button>
            </div>

            <div className="DiffModalBody">
              {diffTextToShow &&
                diffTextToShow.split("\n").map((line, index) => {
                  let lineClass = "";

                  if (line.startsWith("diff --git ")) {
                    return (
                      <h4 key={index}>
                        {diffFiles.map((file) =>
                          line.includes(` b/${file.file}`) ? file.file : "",
                        )}
                      </h4>
                    );
                  }

                  if (
                    !line.startsWith("index") &&
                    !line.startsWith("+++ b/") &&
                    !line.startsWith("--- a/")
                  ) {
                    if (line.startsWith("+") && !line.startsWith("+++")) {
                      lineClass = "diff-line-add";
                    } else if (
                      line.startsWith("-") &&
                      !line.startsWith("---")
                    ) {
                      lineClass = "diff-line-del";
                    } else if (line.startsWith("@@")) {
                      lineClass = "diff-line-hunk";
                    }

                    return (
                      <pre key={index} className={lineClass}>
                        {line}
                      </pre>
                    );
                  }

                  return null;
                })}
            </div>
          </div>
        </div>
      )}
      {showCommitShow && (
        <div className="DiffModal">
          <div className="DiffModalContent">
            <div className="DiffModalHeader">
              <span>
                Showing &nbsp;
                {selectedCommit ? selectedCommit.hash.substring(0, 7) : "?"}
              </span>
              <button
                className="DiffCloseButton"
                onClick={() => setShowCommitShow(false)}
              >
                Fermer
              </button>
            </div>
            <div className="DiffModalBody">
              {selectedCommitShowText &&
                selectedCommitShowText
                  .split("\n")
                  .splice(0, 3)
                  .map((line, index) => {
                    let lineClass = "";

                    if (index === 0) {
                      return (
                        <dl>
                          <dt>
                            <h4 key={index}>
                              {line.split(" ")[0].charAt(0).toUpperCase() +
                                line.split(" ")[0].slice(1)}{" "}
                              :{" "}
                            </h4>
                          </dt>
                          <dd>
                            <h4>
                              <span className="diff-line-hunk">
                                {line.split(" ")[1]}
                              </span>
                            </h4>
                          </dd>
                        </dl>
                      );
                    }
                    if (index === 1) {
                      return (
                        <dl>
                          <dt>
                            <h4 key={index}>{line.trim().split(":")[0]} : </h4>
                          </dt>
                          <dd>
                            <h4>
                              <span className="diff-line-hunk">
                                {line
                                  .trim()
                                  .split(":")
                                  .slice(1)
                                  .join(":")
                                  .trim()}
                              </span>
                            </h4>
                          </dd>
                        </dl>
                      );
                    }
                    if (index === 2) {
                      return (
                        <>
                          <dl>
                            <dt>
                              <h4 key={index}>
                                {line.trim().split(":")[0]} :{" "}
                              </h4>
                            </dt>
                            <dd>
                              <h4>
                                <span className="diff-line-hunk">
                                  {line
                                    .trim()
                                    .split(":")
                                    .slice(1)
                                    .join(":")
                                    .trim()}
                                </span>
                              </h4>
                            </dd>
                          </dl>

                          <dl>
                            <dt>
                              <h4>Message : </h4>
                            </dt>
                            <dd>
                              <h4>
                                <span className="diff-line-hunk">
                                  {selectedCommit.message}
                                </span>
                              </h4>
                            </dd>
                          </dl>
                        </>
                      );
                    }

                    return "";
                  })}
              {selectedCommitShowText &&
                selectedCommitShowText
                  .split("diff --git")
                  .splice(1)
                  .join("diff --git")
                  .split("\n")
                  .map((line, index) => {
                    let lineClass = "";

                    if (index === 0) {
                      line = "diff --git " + line;
                    }

                    if (line.startsWith("diff --git ")) {
                      return (
                        <h4 key={index}>
                          {selectedCommitShowDiffFiles.map((file) =>
                            line.includes(` b/${file.file}`) ? file.file : "",
                          )}
                        </h4>
                      );
                    }

                    if (
                      !line.startsWith("index") &&
                      !line.startsWith("+++ b/") &&
                      !line.startsWith("--- a/")
                    ) {
                      if (line.startsWith("+") && !line.startsWith("+++")) {
                        lineClass = "diff-line-add";
                      } else if (
                        line.startsWith("-") &&
                        !line.startsWith("---")
                      ) {
                        lineClass = "diff-line-del";
                      } else if (line.startsWith("@@")) {
                        lineClass = "diff-line-hunk";
                      }

                      return (
                        <pre key={index} className={lineClass}>
                          {line}
                        </pre>
                      );
                    }

                    return "";
                  })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GitCommitList;
