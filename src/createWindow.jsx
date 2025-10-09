import React from "react";

export default function CreateWindow() {
  return (<>

          <div id="barre_de_taches">
            <nav class="GitCthulhu">
              <ul>
                <li><a href="#" class="secondary">...</a></li>
              </ul>
              <ul>
                <li><a href="#" onClick={() => {openTerminal("/")}}>Terminal</a></li>
              </ul>
            </nav>
          </div>

          <div class="GitCthulhuLeft">

            <div>
              <h4>Les actions</h4>
            </div>

            <ul class="GitList">
              <li class="GitCthulhu">Action 1</li>
              <li class="GitCthulhu">Action 2</li>
              <li class="GitCthulhu">Action 3</li>
            </ul>

          </div>

          <div class="GitCthulhuSideshow">
            <h1>Hello from Electron renderer!</h1>
            <p>👋</p>
          </div>

          <div class="GitCthulhuFoot">
            <Status/>
            <div class="mainOperations">
              <button class="secondary">quand selec</button>
              <button>+</button>
              <button onClick={() => window.electronAPI.openSelectWindow()}>
                Nouvelle fenêtre
              </button>

              <button class="secondary" onClick={() => window.electronAPI.closeWindow()}>
                Fermer
              </button>
            </div>
          </div>
      </>);
}

function openTerminal(path) {
  window.electronAPI.openTerminal(path);
}

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: null, 
      got: true
    };
  }

  async componentDidMount() {
    // à chaque changement de dépôt sélectionné, on met à jour le status
    await window.electronAPI.gitActions.status().then((status) => {
      this.setState({status});
      this.setState({got: true})
    });
  }

  render() {
    let status = "🔴 Could not get the status";

    console.log(this.state);

    if(this.state.got){  
      if(this.state.status != null){
            
        if (this.state.status.ahead == this.state.status.behind) {
          status = `🟢 Branch : ${this.state.status.current} - Up to date`;
        } else if (this.state.status.ahead > this.state.status.behind) {
          status = `🔵 Branch : ${this.state.status.current} - Ahead by ${this.state.status.ahead} commit(s)`;
        } else if (this.state.status.behind > this.state.status.ahead) {
          status = `🟠 Branch : ${this.state.status.current} - Behind by ${this.state.status.behind} commit(s)`;
        }
      }else{
        status = "🔴 Could not get the status";
      }
    }else{
      status = "Waiting for status ...";
    }

    return (<span aria-busy={!this.state.got} class="status">{status}</span>);
  }
}