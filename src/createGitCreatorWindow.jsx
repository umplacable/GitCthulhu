import React from "react";

export default function CreateGitCreatorWindow() {
  return (<>

    <div id="barre_de_taches">
      <nav class="GitCthulhu">
        <ul>
          <li><a href="#" class="secondary">...</a></li>
          <li><a href="#">Connection</a></li>
        </ul>
        <ul>
          <li><a href="#" onClick={() => {openTerminal("/")}}>Terminal</a></li>
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
        <p class="repInfo"></p>
      </div>
    </div>

    <div class="GitCthulhuFoot">
      <div class="mainOperations">
        <button class="secondary" 
                onClick={ () => {
                  // on récupère le dépôt sélectionné
                  const repos = document.getElementsByClassName("GitCthulhuSelected");
                  if (repos.length === 0) return;
                  openRepo(repos[0].id.split(/[\\/]/).pop(), repos[0].id);
                }}>Ouvrir</button>
        <button onClick={ () => {window.electronAPI.addRepository()}} >Add</button>
        <button class="contrast" onClick={ () => {
                                            // on récupère le dépôt sélectionné
                                            const repos = document.getElementsByClassName("GitCthulhuSelected");
                                            if (repos.length === 0) return;
                                            window.electronAPI.deleteRepository(repos[0].id.split(/[\\/]/).pop())
                                            }} >Delete</button>
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
            onDoubleClick={() => {
              openRepo(item, this.state.paths[repos.indexOf(item)]);
            }}
            onClick={() => {
              const p = document.getElementsByClassName("repInfo");
              const list = document.getElementsByClassName("GitList");
              p[0].innerText = "Loading README.md...";

              window.electronAPI.getReadme(this.state.paths[repos.indexOf(item)]).then((data) => {
                if (data === null) {
                  p[0].innerText = "No README.md found in this repository.";
                } else {
                  p[0].innerHTML = data;
                }
              });

              const elements = document.getElementsByClassName("GitCthulhuSelected");
              elements[0]?.classList.replace("GitCthulhuSelected","GitCthulhu");
              const element = document.getElementById(this.state.paths[repos.indexOf(item)]);
              element?.classList.replace("GitCthulhu", "GitCthulhuSelected");

            }}
            id={this.state.paths[repos.indexOf(item)]}
          >
            {item}
            <p class="complement">{this.state.paths[repos.indexOf(item)]}</p>
          </li>
        ))}
      </ul>
    );
  }
}

function openTerminal(path) {
  window.electronAPI.openTerminal(path);
}

function openRepo(name, path) {
  window.electronAPI.openSelectWindow(name, path);
  window.electronAPI.closeWindow();
}