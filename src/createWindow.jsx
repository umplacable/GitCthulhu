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

            <ul class="GitList GitAction">
              
              <GitSimpleAction nom="Pull" action={window.electronAPI.gitActions.pull} />
              <GitSimpleAction nom="Push" action={window.electronAPI.gitActions.push} />
              <GitCommitAction nom="Commit" action={window.electronAPI.gitActions.commit}/>
              <GitBranchList nom="Checkout branches" action={window.electronAPI.gitActions.branch}/>

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
    }, 1000); // toutes les secondes
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
    }, 500); // 2 fois toutes les secondes
    
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
              <th></th>
            </tr>
          </thead>  
          
          <tbody>
            {commits.map((commit, index)=>(
                <tr>
                  <td className="full">{commit.date}</td>
                  <td>{commit.author_name}</td>
                  <td>{commit.message}</td>
                  <td>
                    {index === 0 && (
                        <button onClick={() => {
                          window.electronAPI.gitActions.ammend();
                          const element = document.getElementById("Commit");
                          element.innerText = "Commit ammend";

                          const TextArea = document.getElementById("CommitMessage");
                          TextArea.value = commit.message;
                          TextArea.classList.remove("Hiden")
                          TextArea.focus();
                        }}>
                          Ammend
                        </button>
                      )
                    }

                  </td>
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

class GitSimpleAction extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    
    return(
      <li tabIndex="0" 
          aria-busy="false" 
          onClick={async () => {
                const element = document.getElementById(this.props.nom+"Satus");
                element.setAttribute("aria-busy","true");
                let res = await this.props.action();
                element.setAttribute("aria-busy","false");

                console.log(res);
                }} class="GitCthulhu" id={this.props.nom}>
                  {this.props.nom}
                  <span id={this.props.nom+"Satus"} className="StatusSpan"/>
      </li>
              
    )
  }
}

class GitComplexAction extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    
    return(
      <li tabIndex="0" 
          aria-busy="false" 
          onClick={async () => {
                const element = document.getElementById(this.props.nom+"Satus");
                element.setAttribute("aria-busy","true");
                let res = await this.props.action(this.props.param);
                element.setAttribute("aria-busy","false");

                console.log(res);
                }} class="GitCthulhu" id={this.props.nom}>
                  {this.props.nom}
                  <span id={this.props.nom+"Satus"} className="StatusSpan"/>
      </li>
              
    )
  }
}

class GitCommitAction extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    
    return(
      <li tabIndex="0"  
        class="GitCthulhu GitComplex">

                <div
                tabIndex="0"  
                onClick={async () => {
                      const element = document.getElementById(this.props.nom+"Satus");
                      const message = document.getElementById("CommitMessage");
                      const titre = document.getElementById("Commit")

                      if(message.classList.contains("Hiden")){
                        
                        message.classList.remove("Hiden")

                      }else if(!message.classList.contains("Hiden") && message.value === "" ){

                        message.classList.add("Hiden")

                      }else{
                        element.setAttribute("aria-busy","true");

                        await window.electronAPI.gitActions.add()
                        let ret = await window.electronAPI.gitActions.commit(message.value);
                        console.log(ret)

                        element.setAttribute("aria-busy","false");

                        titre.innerText = "Commit";
                        message.classList.add("Hiden")

                        message.value = "";
                      }
                      
                      }} class="GitCthulhu list">
                  <span id={this.props.nom}>{this.props.nom}</span>
                  <span id={this.props.nom+"Satus"} className="StatusSpan" aria-busy="false"/>
                </div>

                <textarea id="CommitMessage" 
                          name="CommitMessage" 
                          rows="5" 
                          cols="50" 
                          placeholder="Commit message ..."
                          autoComplete="on"
                          className="Hiden"
                />
      </li>   
    )
  }
}

class GitBranchList extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      branches : null,
      got : false 
    }
  }

  async componentDidMount(){
    let branches = await window.electronAPI.gitActions.branchList();
    this.setState({ branches , got : true});

    console.log(branches);

    // Démarre l’intervalle d’actualisation
    this.interval = setInterval(async() => {
      // à chaque changement de dépôt sélectionné, on met à jour le status
      await window.electronAPI.gitActions.branchList().then((branches) => {
        this.setState({branches});
      });
    }, 1000); // toutes les secondes
  }

  render(){
    
    return(
      <li tabIndex="0"  
        class="GitCthulhu GitBranchList GitComplex">

        <div
        tabIndex="0"  
        className="GitCthulhu list"
        onClick={() => {
          const list = document.getElementById("branchList");

          if(list.classList.contains("Hiden")){
            list.classList.remove("Hiden")
          }else{
            list.classList.add("Hiden")
          }
        }}>
          <span id={this.props.nom}>{this.props.nom}</span>
          <span className="StatusSpan"/>
        </div>
        <ul id="branchList" className="Hiden">

          {this.state.got && this.state.branches?.all?.length > 0 ? (
              this.state.branches.all.map((branche) => (
                <GitComplexAction
                  nom={branche}
                  action={window.electronAPI.gitActions.checkout}
                  param={branche}
                />
              ))
            ) : (
              <li>Aucune branche trouvée</li>
            )}
        </ul>
      </li>
              
    )
  }
}