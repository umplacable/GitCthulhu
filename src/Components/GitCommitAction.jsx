import React from "react";

class GitCommitAction extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    message: "",
    visible: false,
  };

  commit = async () => {
    const element = document.getElementById(this.props.nom + "Satus");

    element.setAttribute("aria-busy", "true");

    await window.electronAPI.gitActions.add();
    const ret = await window.electronAPI.gitActions.commit(this.state.message);

    console.log(ret);

    element.setAttribute("aria-busy", "false");

    this.setState({ message: "", visible: false });
  };

  handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (this.state.message.trim() !== "") {
        this.commit();
      }
    }
  };

  render() {
    return (
      <li tabIndex="0" class="GitCthulhu GitComplex">
        <div
          tabIndex="0"
          onClick={async () => {
            if (this.state.visible && !this.state.message === "") {
              this.commit();
            }

            this.setState({ visible: !this.state.visible });
          }}
          class="GitCthulhu list"
        >
          <span id={this.props.nom}>{this.props.nom}</span>
          <span
            id={this.props.nom + "Satus"}
            className="StatusSpan"
            aria-busy="false"
          />
        </div>

        {this.state.visible && (
          <textarea
            rows="5"
            cols="50"
            placeholder="Commit message ..."
            value={this.state.message}
            onChange={(e) => this.setState({ message: e.target.value })}
            onKeyDown={this.handleKeyDown}
            autoFocus
          />
        )}
      </li>
    );
  }
}

export default GitCommitAction;
