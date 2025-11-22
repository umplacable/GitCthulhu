import React from "react";

class GitCommitList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
      baseCommit: null,      // commit de base (1er clic)
      compareCommit: null,   // commit de comparaison (2e clic)
      diffText: "",          // texte du diff brut
      showDiff: false,       // contrôle de l’affichage de la fenêtre de diff
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

  async handleRowClick(commit) {
    this.setState((prevState) => {
      let base = prevState.baseCommit;
      let compare = prevState.compareCommit;

      // Aucun commit sélectionné → on définit la base
      if (!base && !compare) {
        base = commit;
        compare = null;
      }
      // Une base, pas encore de comparaison, et on reclique sur la même → reset
      else if (base && !compare && base.hash === commit.hash) {
        base = null;
        compare = null;
      }
      // Une base, pas encore de comparaison, et on clique sur un autre commit → comparaison
      else if (base && !compare && base.hash !== commit.hash) {
        compare = commit;
      }
      // Les deux sont déjà remplis → on recommence la sélection avec ce commit comme nouvelle base
      else {
        base = commit;
        compare = null;
      }

      return {
        baseCommit: base,
        compareCommit: compare,
        // Si on recommence une sélection, on masque l’ancienne diff
        showDiff: false,
      };
    }, async () => {
      const { baseCommit, compareCommit } = this.state;

      // Dès qu’on a les deux commits, on demande le diff au backend
      if (baseCommit && compareCommit) {
        const diff = await window.electronAPI.gitActions.diff(
          baseCommit.hash,
          compareCommit.hash
        );
        this.setState({ diffText: diff, showDiff: true });
      }
    });
  }

  render(){

    const commits = this.state.commits;

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
                <button
                  className="DiffCloseButton"
                  onClick={() => this.setState({ showDiff: false })}
                >
                  Fermer
                </button>
              </div>

              <div className="DiffModalBody">
                {this.state.diffText &&
                  this.state.diffText.split("\n").map((line, index) => {
                    let lineClass = "";
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