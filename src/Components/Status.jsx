import React from "react";

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null,
      got: true,
    };
  }

  async componentDidMount() {
    // à chaque changement de dépôt sélectionné, on met à jour le status
    await window.electronAPI.gitActions.status().then((status) => {
      this.setState({ status });
      this.setState({ got: true });
    });

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async () => {
      // à chaque changement de dépôt sélectionné, on met à jour le status
      await window.electronAPI.gitActions.status().then((status) => {
        this.setState({ status });
      });
    }, 1000); // toutes les secondes
  }

  componentWillUnmount() {
    // Nettoie l’intervalle pour éviter les fuites mémoire
    clearInterval(this.interval);
  }

  render() {
    let status = "";

    if (this.state.got) {
      if (this.state.status != null) {
        if (this.state.status.ahead == this.state.status.behind) {
          status = `🟢 Up to date - Branch : ${this.state.status.current}`;
        } else if (this.state.status.ahead > this.state.status.behind) {
          status = `🔵 Ahead by ${this.state.status.ahead} commit(s) - Branch : ${this.state.status.current}`;
        } else if (this.state.status.behind > this.state.status.ahead) {
          status = `🟠 Behind by ${this.state.status.behind} commit(s) - Branch : ${this.state.status.current}`;
        }
      } else {
        status = "🔴 Could not get the status";
      }
    } else {
      status = "Waiting for status ...";
    }

    return (
      <span aria-busy={!this.state.got} class="status">
        {status}
      </span>
    );
  }
}

export default Status;
