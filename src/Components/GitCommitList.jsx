import React from "react";

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

export default GitCommitList;