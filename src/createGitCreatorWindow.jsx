import React from "react";

export default function CreateGitCreatorWindow() {
  return (<>

    <div id="barre_de_taches">
      <nav class="GitCthulhu">
        <ul>
          <li><a href="#" class="secondary">...</a></li>
        </ul>
        <ul>
          <li><a href="#">Terminal</a></li>
        </ul>
      </nav>
    </div>

    <div class="GitCthulhuLeft">

      <div>
        <h4>Repositories</h4>
      </div>

      <GitList/>

    </div>

    <div class="GitCthulhuSideshow">
      <div>
        <p> infos sur le dépôt </p>
      </div>
    </div>

    <div class="GitCthulhuFoot">
      <div class="mainOperations">
        <button class="secondary">quand selec</button>
        <button>+</button>
      </div>
    </div>

  </>);
}

// création d'un élément listant les dépôts

class GitList extends React.Component {

  getListItems() {
    return ['Repository 1', 'Repository 2', 'Repository 3']
  }

  render() {

    const listItems = this.getListItems().map(
      (item) => <li 
                  class="GitCthulhu" 
                  onClick={() => {
                    window.electronAPI.openSelectWindow();
                    window.electronAPI.closeWindow();
                  }}>
                {item}
                </li>
    );

    return (
      <ul class="GitList">
        {listItems}
      </ul>
    );
  }
}