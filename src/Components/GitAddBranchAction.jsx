import React from "react";

class GitAddBranchAction extends React.Component {
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
                      const message = document.getElementById("BranchName");
                      const titre = document.getElementById("Branch")

                      if(message.classList.contains("Hiden")){
                        
                        message.classList.remove("Hiden")

                      }else if(!message.classList.contains("Hiden") && message.value === "" ){

                        message.classList.add("Hiden")

                      }else{
                        element.setAttribute("aria-busy","true");

                        let ret = await window.electronAPI.gitActions.addbranch(message.value);
                        console.log(ret)

                        element.setAttribute("aria-busy","false");

                        titre.innerText = "AddBranch";
                        message.classList.add("Hiden")

                        message.value = "";
                      }
                      
                      }} class="GitCthulhu list">
                  <span id="Branch">{this.props.nom}</span>
                  <span id={this.props.nom+"Satus"} className="StatusSpan" aria-busy="false"/>
                </div>

                <input    type="text" 
                          id="BranchName" 
                          name="BranchName"
                          placeholder="Branch name ..."
                          className="Hiden"
                />
      </li>   
    )
  }
}

export default GitAddBranchAction;