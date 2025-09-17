import React from "react";

export default function CreateGitCreatorWindow() {
  return ( <> 

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

            <ul>
              <li class="GitCthulhu">Repository 1</li>
              <li class="GitCthulhu">Repository 2</li>
              <li class="GitCthulhu">Repository 3</li>
            </ul>

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