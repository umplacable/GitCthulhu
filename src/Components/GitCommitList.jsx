import React from "react";

class GitCommitList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      baseCommit: null,         // 1er commit sélectionné
      compareCommit: null,      // 2e commit sélectionné
      diffText: "",             // diff brut complet
      showDiff: false,          // affiche ou non la fenêtre
      diffFiles: [],            // liste des fichiers modifiés {file, text}
      selectedFile: "__ALL__",  // fichier actuellement affiché ("__ALL__" = tous)
    };

    this.handleRowClick = this.handleRowClick.bind(this);
  }


  async componentDidMount() {
    const ret = await window.electronAPI.gitActions.log();
    const commits = ret.all.map((x) => x);

    commits.forEach(commit => {
      let dateCommit = new Date(Date.parse(commit.date));
      commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" })
    });

    this.setState({ commits });

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async() => {
      const ret = await window.electronAPI.gitActions.log();
      const commits = ret.all.map((x) => x);

      commits.forEach(commit => {
        let dateCommit = new Date(Date.parse(commit.date));
        commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" })
      });

      this.setState({ commits });
    }, 500); // 2 fois toutes les secondes
    
  }

    parseDiffByFile(diffText) {
    const lines = diffText.split("\n");
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
          // on ignore ce qui précède le premier "diff --git"
          continue;
        }
        currentLines.push(line);
      }
    }

    flush();
    return files;
  }

  componentDidUpdate(prevProps) {
    // Si on désactive le mode diff, on nettoie la sélection et on ferme la fenêtre
    if (prevProps.diffMode && !this.props.diffMode) {
      this.setState({
        baseCommit: null,
        compareCommit: null,
        diffText: "",
        showDiff: false,
        diffFiles: [],
        selectedFile: "__ALL__",
      });
    }
  }


  async handleRowClick(commit) {
    // 🔒 Blocage HARD : tant que le mode Diff n'est pas actif,
    // on NE FAIT RIEN : pas de setState, pas de sélection.
    if (!this.props.diffMode) {
      return;
    }

    this.setState(
      (prevState) => {
        let base = prevState.baseCommit;
        let compare = prevState.compareCommit;

        if (!base && !compare) {
          // 1er clic → base
          base = commit;
          compare = null;
        } else if (base && !compare && base.hash === commit.hash) {
          // Re-clic sur la même base → reset
          base = null;
          compare = null;
        } else if (base && !compare && base.hash !== commit.hash) {
          // 2e clic sur un autre commit → compare
          compare = commit;
        } else {
          // Déjà 2 commits sélectionnés → on repart avec une nouvelle base
          base = commit;
          compare = null;
        }

        return {
          baseCommit: base,
          compareCommit: compare,
          showDiff: false,
        };
      },
      async () => {
        const { baseCommit, compareCommit } = this.state;

        if (baseCommit && compareCommit) {
          const diffText = await window.electronAPI.gitActions.diff(
            baseCommit.hash,
            compareCommit.hash
          );
          const diffFiles = this.parseDiffByFile(diffText);

          this.setState({
            diffText,
            diffFiles,
            selectedFile:
              diffFiles.length > 0 ? diffFiles[0].file : "__ALL__",
            showDiff: true,
          });
        }
      }
    );
  }



  render(){
    const { commits } = this.state;

    // Choix du texte à afficher selon le fichier sélectionné
    let diffTextToShow = this.state.diffText;
    if (
      this.state.selectedFile &&
      this.state.selectedFile !== "__ALL__"
    ) {
      const fileObj = this.state.diffFiles.find(
        (f) => f.file === this.state.selectedFile
      );
      if (fileObj) {
        diffTextToShow = fileObj.text;
      }
    }

    return(
      <div className="GraphBranches">
        <table className="CommitList">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Message</th>
              <th></th>
            </tr>
          </thead>  
          
          <tbody>
            {commits.map((commit, index) => {
              const isBase =
                this.state.baseCommit &&
                this.state.baseCommit.hash === commit.hash;
              const isCompare =
                this.state.compareCommit &&
                this.state.compareCommit.hash === commit.hash;

              let rowClass = "";
              if (isBase) rowClass += " CommitRowBase";
              if (isCompare) rowClass += " CommitRowCompare";

              return (
                <tr
                  key={commit.hash}
                  className={rowClass}
                  onClick={() => this.handleRowClick(commit)}
                >
                  <td className="full">{commit.date}</td>
                  <td>{commit.author_name}</td>
                  <td>{commit.message}</td>
                  <td>
                    {index === 0 && (
                      <button
                        onClick={(event) => {
                          // On évite que le clic sur Ammend change la sélection
                          event.stopPropagation();

                          window.electronAPI.gitActions.ammend();
                          const element = document.getElementById("Commit");
                          element.innerText = "Commit ammend";

                          const TextArea =
                            document.getElementById("CommitMessage");
                          TextArea.value = commit.message;
                          TextArea.classList.remove("Hiden");
                          TextArea.focus();
                        }}
                      >
                        Ammend
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {this.state.showDiff && (
          <div className="DiffModal">
            <div className="DiffModalContent">
                            <div className="DiffModalHeader">
                <span>
                  Diff&nbsp;
                  {this.state.baseCommit
                    ? this.state.baseCommit.hash.substring(0, 7)
                    : "?"}
                  {" .. "}
                  {this.state.compareCommit
                    ? this.state.compareCommit.hash.substring(0, 7)
                    : "?"}
                </span>

                {/* Menu déroulant des fichiers */}
                {this.state.diffFiles.length > 0 && (
                  <select
                    className="DiffFileSelector"
                    value={this.state.selectedFile || "__ALL__"}
                    onChange={(e) =>
                      this.setState({ selectedFile: e.target.value })
                    }
                  >
                    <option value="__ALL__">Tous les fichiers</option>
                    {this.state.diffFiles.map((file) => (
                      <option key={file.file} value={file.file}>
                        {file.file}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  className="DiffCloseButton"
                  onClick={() => this.setState({ showDiff: false })}
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
                        <h4>{this.state.diffFiles.map((file) => (
                          line.includes(` b/${file.file}`) ? file.file : ""
                        ))}</h4>
                      )

                    }else if (!line.startsWith("index") && !line.startsWith("+++ b/") && !line.startsWith("--- a/")){
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

                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    )

  }
}

export default GitCommitList;