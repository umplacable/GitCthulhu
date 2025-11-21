import React from "react";
import { openRepo } from "../Windows/createGitCreatorWindow";

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

export default GitList;