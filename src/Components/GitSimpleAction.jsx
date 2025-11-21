import React from "react";

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

export default GitSimpleAction;