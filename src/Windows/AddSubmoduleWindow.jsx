import React, { useState } from "react";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function AddSubmoduleWindow() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="container InitContainer">
        {/* Formulaire de CLONE depuis une URL */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const url = e.currentTarget.repoUrl.value?.trim();
            const name = e.currentTarget.repoName.value?.trim();
            if (!url || !name) return;
            setLoading(true);
            await window.electronAPI.gitActions
              .submodule("add", url, name)
              .then(() => {
                window.electronAPI.closeWindow();
              })
              .finally(() => {
                setLoading(false);
              });
          }}
          className="CloneForm"
        >
          <div>
            <div style={{ display: "flex", "flex-direction": "row" }}>
              <div>
                <label htmlFor="repoUrl" className="FormLabel">
                  URL du submodule :
                </label>
                <input
                  id="repoUrl"
                  name="repoUrl"
                  type="text"
                  placeholder="https://exemple.com/mon-submodule.git"
                  required
                />
              </div>
              <div>
                <label htmlFor="repoName" className="FormLabel">
                  Nom du submodule :
                </label>
                <input
                  id="repoName"
                  name="repoName"
                  type="text"
                  placeholder="mon-submodule"
                  required
                />
              </div>
            </div>
            <button aria-busy={loading} type="submit" id="cloneBtn">
              Ajouter le submodule
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
              window.electronAPI.closeWindow();
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}
