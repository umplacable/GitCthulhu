import React from "react";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function CreateWindow() {
  return (<>

          <div id="barre_de_taches">
            <nav class="GitCthulhu">
              <ul>
                <li><a href="#" class="secondary">...</a></li>
              </ul>
              <ul>
                <li><a href="#" onClick={() => {openTerminal()}}>Terminal</a></li>
              </ul>
            </nav>
          </div>

          <div class="GitCthulhuLeft">

            <div>
              <h4>Les actions</h4>
            </div>

            <ul class="GitList">
              <li tabIndex="0" aria-busy="false" onClick={async () => {
                const element = document.getElementById("Pull");
                element.setAttribute("aria-busy","true");
                let res = await window.electronAPI.gitActions.pull();
                element.setAttribute("aria-busy","false");

                console.log(res);
                }} class="GitCthulhu" id="Pull">Pull</li>
              <li tabIndex="0" aria-busy="false" onClick={async() => {
                const element = document.getElementById("Push");
                element.setAttribute("aria-busy","true");
                let res = await window.electronAPI.gitActions.push();
                element.setAttribute("aria-busy","false");

                console.log(res);
                }} class="GitCthulhu" id="Push">Push</li>
              <li tabIndex="0" class="GitCthulhu">Action 3</li>
            </ul>

          </div>

          <div class="GitCthulhuSideshow">
            <GitCommitList/>
          </div>

          <div class="GitCthulhuFoot">
            <Status/>
            <div class="mainOperations">
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
      got: true,
    };
  }

  async componentDidMount() {

    // à chaque changement de dépôt sélectionné, on met à jour le status
    await window.electronAPI.gitActions.status().then((status) => {
      this.setState({status});
      this.setState({got: true})
    });

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async() => {
      // à chaque changement de dépôt sélectionné, on met à jour le status
      await window.electronAPI.gitActions.status().then((status) => {
        this.setState({status});
      });
    }, 5000); // toutes les 5 secondes
  }

  componentWillUnmount() {
    // Nettoie l’intervalle pour éviter les fuites mémoire
    clearInterval(this.interval);
  }

  render() {
    let status = "";

    if(this.state.got){  
      if(this.state.status != null){
            
        if (this.state.status.ahead == this.state.status.behind) {
          status = `🟢 Up to date - Branch : ${this.state.status.current}`;
        } else if (this.state.status.ahead > this.state.status.behind) {
          status = `🔵 Ahead by ${this.state.status.ahead} commit(s) - Branch : ${this.state.status.current}`;
        } else if (this.state.status.behind > this.state.status.ahead) {
          status = `🟠 Behind by ${this.state.status.behind} commit(s) - Branch : ${this.state.status.current}`;
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

class GitCommitList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commits: [],
    };
  }

  async componentDidMount() {
    const ret = await window.electronAPI.gitActions.log();
    const commits = ret.all.map((x) => x);

    commits.forEach(commit => {
      let dateCommit = new Date(Date.parse(commit.date));
      commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" })
    });

    this.setState({ commits });

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async() => {
      const ret = await window.electronAPI.gitActions.log();
      const commits = ret.all.map((x) => x);

      commits.forEach(commit => {
        let dateCommit = new Date(Date.parse(commit.date));
        commit.date = dateCommit.toLocaleString("fr-FR", { timeZone: "UTC" })
      });

      this.setState({ commits });
    }, 1000); // toutes les secondes
    
  }

  render(){
    const commits = this.state.commits;

    return(
      <div className="GraphBranches">
        <table className="CommitList">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Message</th>
            </tr>
          </thead>  
          
          <tbody>
            {commits.map((commit)=>(
                <tr>
                  <td className="full">{commit.date}</td>
                  <td>{commit.author_name}</td>
                  <td>{commit.message}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

function afficheMessage(importance, titre, message){
  // affichera un message avec un logo diférent selon l'importance
  console.log(titre);
  console.log(message);
}
