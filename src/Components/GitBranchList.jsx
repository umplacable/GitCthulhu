import React from "react";
import GitComplexAction from "./GitComplexAction.jsx";

class GitBranchList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      branches: null,
      got: false,
    };
  }

  async componentDidMount() {
    let branches = await window.electronAPI.gitActions.branchList();
    this.setState({ branches, got: true });

    console.log(branches);

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async () => {
      // à chaque changement de dépôt sélectionné, on met à jour le status
      await window.electronAPI.gitActions.branchList().then((branches) => {
        this.setState({ branches });
      });
    }, 1000); // toutes les secondes
  }

  render() {
    return (
      <li tabIndex="0" class="GitCthulhu GitBranchList GitComplex">
        <div
          tabIndex="0"
          className="GitCthulhu list"
          onClick={() => {
            const list = document.getElementById("branchList");

            if (list.classList.contains("Hiden")) {
              list.classList.remove("Hiden");
            } else {
              list.classList.add("Hiden");
            }
          }}
        >
          <span id={this.props.nom}>{this.props.nom}</span>
          <span className="StatusSpan" />
        </div>
        <ul id="branchList" className="Hiden">
          <h6>Branches locales</h6>
          {this.state.got && this.state.branches?.local?.all?.length > 0 ? (
            this.state.branches.local?.all.map((branche) => (
              <GitComplexAction
                nom={branche}
                action={window.electronAPI.gitActions.checkout}
                param={branche}
                status={branche}
              />
            ))
          ) : (
            <li>Aucune branche trouvée</li>
          )}
          <h6>Branches distantes</h6>
          {this.state.got && this.state.branches?.dist?.all?.length > 0 ? (
            this.state.branches.dist?.all.map((branche) => (
              <GitComplexAction
                nom={branche}
                action={window.electronAPI.gitActions.checkout_dist}
                param={branche}
                status={branche}
              />
            ))
          ) : (
            <li>Aucune branche trouvée</li>
          )}
        </ul>
      </li>
    );
  }
}

export default GitBranchList;
