import React from "react";

class GitRebaseAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      branches: null,
      got: false,
      rebasing: false,
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
    const list = document.getElementById("rebaseList");
    if (list) {
      list.classList.toggle("Hiden");
    }
  };

  rebaseBranch = async (branch) => {
    this.setState({ rebasing: true });

    const list = document.getElementById("rebaseList");
    if (list) list.classList.add("Hiden");

    await window.electronAPI.gitActions.rebase(branch);
    // En cas d'échec, main.js affiche une boîte de dialogue native proposant
    // d'annuler le rebase — aucune action supplémentaire nécessaire ici.

    this.setState({ rebasing: false });
  };

  render() {
    return (
      <li tabIndex="0" className="GitCthulhu GitBranchList GitComplex">
        <div
          tabIndex="0"
          className="GitCthulhu list"
          onClick={this.toggleList}
        >
          <span id="Rebase">Rebase</span>
          <span
            id="RebaseStatus"
            className="StatusSpan"
            aria-busy={this.state.rebasing}
          />
        </div>
        <ul id="rebaseList" className="Hiden">
          <h6>Sélectionner la branche de base</h6>
          {this.state.got && this.state.branches?.local?.all?.length > 0 ? (
            this.state.branches.local.all.map((branch) => (
              <li
                key={branch}
                tabIndex="0"
                className="GitCthulhu"
                onClick={() => this.rebaseBranch(branch)}
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

export default GitRebaseAction;
