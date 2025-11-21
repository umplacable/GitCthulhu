import React from "react";

class GitComplexAction extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    
    return(
      <li tabIndex="0" 
          aria-busy="false" 
          onClick={async () => {
                const element = document.getElementById(this.props.status+"Satus");
                element.setAttribute("aria-busy","true");
                let res = await this.props.action(this.props.param);
                element.setAttribute("aria-busy","false");

                console.log(res);
                }} class="GitCthulhu" id={this.props.nom}>
                  {this.props.nom}
                  <span id={this.props.status+"Satus"} className="StatusSpan"/>
      </li>
              
    )
  }
}

export default GitComplexAction;