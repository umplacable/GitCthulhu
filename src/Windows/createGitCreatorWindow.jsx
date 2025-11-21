import React from "react";
import GitList from "../Components/GitList.jsx";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function CreateGitCreatorWindow() {
  return (<>

    <div id="barre_de_taches">
      <nav class="GitCthulhu">
        <ul>
          <li><a href="#" class="secondary">...</a></li>
          <li><a href="#">Connection</a></li>
        </ul>
        <ul>
          <li><a href="#" onClick={() => {openTerminal("/")}}>Terminal</a></li>
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
        <p class="repInfo"></p>
      </div>
    </div>

    <div class="GitCthulhuFoot">
      <span class="status"></span>
      <div class="mainOperations">
        <button class="secondary" 
                onClick={ () => {
                  // on récupère le dépôt sélectionné
                  const repos = document.getElementsByClassName("GitCthulhuSelected");
                  if (repos.length === 0) return;
                  openRepo(repos[0].getAttribute('value').split(/[\\/]/).pop(), repos[0].getAttribute('value'));
                }}>Ouvrir</button>
        <button onClick={ () => {window.electronAPI.addRepository()}} >Add</button>
        <button class="contrast" onClick={ () => {
                                            // on récupère le dépôt sélectionné
                                            const repos = document.getElementsByClassName("GitCthulhuSelected");
                                            if (repos.length === 0) return;
                                            window.electronAPI.deleteRepository(repos[0].id)
                                            }} >Delete</button>
      </div>
    </div>

  </>);
}

function openTerminal(path) {
  window.electronAPI.openTerminal(path);
}

function openRepo(name, path) {
  window.electronAPI.openSelectWindow(name, path);
}

export { openRepo };