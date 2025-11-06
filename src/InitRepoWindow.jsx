import React from "react";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function InitRepoWindow() {
  return (<>

      <div className="container" style={{ paddingTop: "8vh" }}>
        <h3 style={{ textAlign: "center", marginBottom: "6vh" }}>
          Ce dossier n'est pas un dépôt git.
        </h3>

        {/* Bouton INITIALISER */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "4vh" }}>
          <button
            style={{ minWidth: 240, borderRadius: 14 }}
            onClick={() => {
              // initialise un dépôt dans le dossier courant
              window.electronAPI.gitActions.init();
            }}
          >
            initialiser
          </button>
        </div>

        {/* Séparateur "ou" */}
        <div style={{ position: "relative", margin: "3vh 0 4vh" }}>
          <hr />
          <small
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%) translateY(-50%)",
              top: "50%",
              background: "var(--pico-background-color)",
              padding: "0 .6rem",
              opacity: 0.9,
            }}
          >
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
          style={{ maxWidth: 620, margin: "0 auto" }}
        >
          <label
            htmlFor="repoUrl"
            style={{ marginBottom: 8, display: "inline-block" }}
          >
            URL du dépôt :
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              id="repoUrl"
              name="repoUrl"
              type="text"
              placeholder="https://exemple.com/mon-depot.git"
              style={{ flex: 1 }}
              required
            />
            <button
              style={{ minWidth: 160, borderRadius: 14 }}
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

        {/* Bouton Fermer en bas à droite */}
        <div style={{ position: "fixed", right: 16, bottom: 12 }}>
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
