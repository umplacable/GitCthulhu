import React from "react";

class GitAddBranchAction extends React.Component {
  constructor(props){
    super(props);
  }

  state ={
    message : "",
    visible : false
  }

  addBranch = async () => {

    const element = document.getElementById(this.props.nom+"Satus");

    element.setAttribute("aria-busy","true");

    let ret = await window.electronAPI.gitActions.addbranch(this.state.message);
    console.log(ret)

    element.setAttribute("aria-busy","false");

    this.setState({ message: "", visible: false });
  }

  handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (this.state.message.trim() !== "") {
        this.addBranch();
      }
    }
  };

  render(){
    
    return(
      <li tabIndex="0"  
        class="GitCthulhu GitComplex">

                <div
                tabIndex="0"  
                onClick={async () => {

                      if(this.state.visible && !this.state.message === "" ){
                        this.addBranch()
                      }
                      
                      this.setState({ visible: !this.state.visible })
                    }} class="GitCthulhu list">
                  <span id="Branch">{this.props.nom}</span>
                  <span id={this.props.nom+"Satus"} className="StatusSpan" aria-busy="false"/>
                </div>

                {this.state.visible && (
                  <input  type="text" 
                          id="BranchName" 
                          name="BranchName"
                          placeholder="Branch name ..."
                          value={this.state.message}
                          onChange={(e) => this.setState({ message: e.target.value })}
                          onKeyDown={this.handleKeyDown}
                          autoFocus
                  />
                )}
      </li>   
    )
  }
}

export default GitAddBranchAction;