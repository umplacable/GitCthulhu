import React from "react";

class GitMergeAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      branches: null,
      got: false,
      merging: false,
    };
  }

  async componentDidMount() {
    const branches = await window.electronAPI.gitActions.branchList();
    this.setState({ branches, got: true });

    this.interval = setInterval(async () => {
      const branches = await window.electronAPI.gitActions.branchList();
      this.setState({ branches });
    }, 2000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  toggleList = () => {
    const list = document.getElementById("mergeList");
    if (list) {
      list.classList.toggle("Hiden");
    }
  };

  mergeBranch = async (branch) => {
    this.setState({ merging: true });
    // Fermer la liste
    const list = document.getElementById("mergeList");
    if (list) list.classList.add("Hiden");

    const result = await window.electronAPI.gitActions.merge(branch);
    this.setState({ merging: false });

    if (result && result.success) {
      // Merge réussi sans conflit — rien de plus à faire
    }
    // Si résultat.conflicts, la fenêtre de conflit s'ouvre automatiquement depuis main.js
  };

  render() {
    return (
      <li tabIndex="0" className="GitCthulhu GitBranchList GitComplex">
        <div
          tabIndex="0"
          className="GitCthulhu list"
          onClick={this.toggleList}
        >
          <span id="Merge">Merge</span>
          <span
            id="MergeSatus"
            className="StatusSpan"
            aria-busy={this.state.merging}
          />
        </div>
        <ul id="mergeList" className="Hiden">
          <h6>Sélectionner la branche à merger</h6>
          {this.state.got && this.state.branches?.local?.all?.length > 0 ? (
            this.state.branches.local.all.map((branch) => (
              <li
                key={branch}
                tabIndex="0"
                className="GitCthulhu"
                onClick={() => this.mergeBranch(branch)}
              >
                {branch}
              </li>
            ))
          ) : (
            <li>Aucune branche trouvée</li>
          )}
        </ul>
      </li>
    );
  }
}

export default GitMergeAction;
