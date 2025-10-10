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
      <span class="status"></span>
      <div class="mainOperations">
        <button class="secondary" 
                onClick={ () => {
                  // on récupère le dépôt sélectionné
                  const repos = document.getElementsByClassName("GitCthulhuSelected");
                  if (repos.length === 0) return;
                  openRepo(repos[0].getAttribute('value').split(/[\\/]/).pop(), repos[0].getAttribute('value'));
                }}>Ouvrir</button>
        <button onClick={ () => {window.electronAPI.addRepository()}} >Add</button>
        <button class="contrast" onClick={ () => {
                                            // on récupère le dépôt sélectionné
                                            const repos = document.getElementsByClassName("GitCthulhuSelected");
                                            if (repos.length === 0) return;
                                            window.electronAPI.deleteRepository(repos[0].id)
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
      keys: []
    };
  }

  async componentDidMount() {
    const config = await window.electronAPI.getConfig();
    const paths = config.Depo.paths.split(",").map((x) => x.trim());
    const repos = config.Depo.names.split(",").map((x) => x.trim());
    const keys = config.Depo.ids.split(",").map((x) => x.trim());
    this.setState({ repos , paths , keys });
  }

  render() {
    const { keys } = this.state;

    return (
      <ul className="GitList">
        {keys.map((item) => (
          <li
            tabindex = "0"
            className="GitCthulhu"
            onDoubleClick={() => {
              openRepo(this.state.repos[keys.indexOf(item)], this.state.paths[keys.indexOf(item)]);
            }}
            onClick={() => {
              const p = document.getElementsByClassName("repInfo");
              p[0].innerText = "Loading README.md...";

              window.electronAPI.getReadme(this.state.paths[keys.indexOf(item)]).then((data) => {
                if (data === null) {
                  p[0].innerText = "No README.md found in this repository.";
                } else {
                  p[0].innerHTML = data;
                }
              });

              const elements = document.getElementsByClassName("GitCthulhuSelected");
              elements[0]?.classList.replace("GitCthulhuSelected","GitCthulhu");
              const element = document.getElementById(this.state.keys[keys.indexOf(item)]);
              element?.classList.replace("GitCthulhu", "GitCthulhuSelected");

            }}
            
            onKeyDown={(e)=>{
              if (e.key == "Enter" || e.key == " ") {
                const element = document.getElementById(this.state.keys[keys.indexOf(item)]);
                element.click()
              }
            }}

            id={this.state.keys[keys.indexOf(item)]}
            value={this.state.paths[keys.indexOf(item)]}
          >
            {this.state.repos[keys.indexOf(item)]}
            <p class="complement">{this.state.paths[keys.indexOf(item)]}</p>
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