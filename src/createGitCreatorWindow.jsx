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
        <p class="repInfo"></p>
      </div>
    </div>

    <div class="GitCthulhuFoot">
      <div class="mainOperations">
        <button class="secondary">quand selec</button>
        <button onClick={ () => {window.electronAPI.addRepository()}} >Add</button>
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
              window.electronAPI.openSelectWindow(item, this.state.paths[repos.indexOf(item)]);
              window.electronAPI.closeWindow();
            }}
            onClick={() => {
              const p = document.getElementsByClassName("repInfo");

              window.electronAPI.getReadme(this.state.paths[repos.indexOf(item)]).then((data) => {
                if (data === null) {
                  p[0].innerText = "No README.md found in this repository.";
                } else {
                  p[0].innerHTML = data;
                }
              });
            }}
          >
            {item}
            <p class="complement">{this.state.paths[repos.indexOf(item)]}</p>
          </li>
        ))}
      </ul>
    );
  }
}

