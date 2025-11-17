import React from "react";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function InitRepoWindow() {
  return (<>

      <div className="container InitContainer">
        <h3>
          Ce dossier n'est pas un dépôt git.
        </h3>

        {/* Bouton INITIALISER */}
        <div className="InitBtn">
          <button
            onClick={() => {
              // initialise un dépôt dans le dossier courant
              window.electronAPI.gitActions.init();
            }}
          >
            initialiser
          </button>
        </div>

        {/* Séparateur "ou" */}
        <div className="separateur">
          <hr />
          <small className="Ou">
            ou
          </small>
        </div>

        {/* Formulaire de CLONE depuis une URL */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const url = e.currentTarget.repoUrl.value?.trim();
            if (!url) return;
            window.electronAPI.gitActions.clone(url);
          }}
          className="CloneForm"
        >
          <label
            htmlFor="repoUrl"
            className="FormLabel"
          >
            URL du dépôt :
          </label>
          <div>
            <input
              id="repoUrl"
              name="repoUrl"
              type="text"
              placeholder="https://exemple.com/mon-depot.git"
              required
            />
            <button
              type="submit"
              id="cloneBtn"
              onClick={() => {
                // ajoute l'attribut aria-busy="true" a ce bouton pour indiquer le chargement si l'url est valide
                if (document.getElementById("repoUrl").value.trim() !== "") {
                  document.getElementById("cloneBtn").setAttribute("aria-busy", "true");
                }
              }}
            >
              cloner
            </button>
          </div>
        </form>
      </div>

      <div class="GitCthulhuFoot">
      <span class="status"></span>
      <div class="mainOperations">
         <button
            className="secondary"
            onClick={() => {
              window.electronAPI.closeWindow()
            }}
          >
            Fermer
          </button>
      </div>
    </div>

    </>);
}
