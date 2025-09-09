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

        <main class="container">

          <div>
            <ul>
              <li class="GitCthulhu">Repository 1</li>
              <li class="GitCthulhu">Repository 2</li>
              <li class="GitCthulhu">Repository 3</li>
            </ul>
          </div>

          <div>
              <form id="openForm" action="#" method="post">
                  <fieldset>
                  <h4>Open an existing repository</h4>
                  <label for="existingRepoPath">Repository path:</label>
                  <input
                      type="text"
                      id="existingRepoPath"
                      name="existingRepoPath"
                      required
                  />
                  <br />
                  <button type="submit">Open Repository</button>
                  </fieldset>
              </form>
          </div>

        </main>
    </>);
}