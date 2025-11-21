import React from "react";

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

export default GitCommitAction;