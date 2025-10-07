import React from "react";

export default function CreateWindow() {
  return (<>

          <div id="barre_de_taches">
            <nav class="GitCthulhu">
              <ul>
                <li><a href="#" class="secondary">...</a></li>
              </ul>
              <ul>
                <li><a href="#" onClick={() => {openTerminal("/")}}>Terminal</a></li>
              </ul>
            </nav>
          </div>

          <div class="GitCthulhuLeft">

            <div>
              <h4>Les actions</h4>
            </div>

            <ul class="GitList">
              <li class="GitCthulhu">Action 1</li>
              <li class="GitCthulhu">Action 2</li>
              <li class="GitCthulhu">Action 3</li>
            </ul>

          </div>

          <div class="GitCthulhuSideshow">
            <h1>Hello from Electron renderer!</h1>
            <p>👋</p>
          </div>

          <div class="GitCthulhuFoot">
            <div class="mainOperations">
              <button class="secondary">quand selec</button>
              <button>+</button>
              <button onClick={() => window.electronAPI.openSelectWindow()}>
                Nouvelle fenêtre
              </button>

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