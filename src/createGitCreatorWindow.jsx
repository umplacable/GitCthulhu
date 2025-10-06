import React from "react";

export default function CreateGitCreatorWindow() {
  return (<>

    <div id="barre_de_taches">
      <nav class="GitCthulhu">
        <ul>
          <li><a href="#" class="secondary">...</a></li>
        </ul>
        <ul>
          <li><a href="#">Terminal</a></li>
        </ul>
      </nav>
    </div>

    <div class="GitCthulhuLeft">

      <div>
        <h4>Repositories</h4>
      </div>

      <GitList/>

    </div>

    <div class="GitCthulhuSideshow">
      <div>
        <p> infos sur le dépôt </p>
      </div>
    </div>

    <div class="GitCthulhuFoot">
      <div class="mainOperations">
        <button class="secondary">quand selec</button>
        <GitAddDirectory/>
      </div>
    </div>

  </>);
}

// création d'un élément listant les dépôts

class GitList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      repos: [],
      paths: [],
    };
  }

  async componentDidMount() {
    const config = await window.electronAPI.getConfig();
    const paths = config.Depo.paths.split(",").map((x) => x.trim());
    const repos = config.Depo.names.split(",").map((x) => x.trim());
    this.setState({ repos , paths });
  }

  render() {
    const { repos } = this.state;

    return (
      <ul className="GitList">
        {repos.map((item) => (
          <li
            className="GitCthulhu"
            onClick={() => {
              window.electronAPI.openSelectWindow();
              window.electronAPI.closeWindow();
            }}
          >
            {item}
            <br/>
            {this.state.paths[repos.indexOf(item)]}
          </li>
        ))}
      </ul>
    );
  }
}

class GitAddDirectory extends React.Component {

  render() {
    return (
      <button onClick={window.electronAPI.addRepository()}>Add</button>
    );
  }
}