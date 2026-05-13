import React, { use, useEffect, useState } from "react";
import { GitSingleRemote } from "../Components/GitSingleRemote.jsx";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function GitConfigWindow() {
  const [scope, setScope] = useState("");
  const [config, setconfig] = useState({});

  useEffect(() => {
    window.electronAPI.getScope().then((scope) => {
      setScope(scope);
    });
  }, []);

  useEffect(() => {
    if (scope) {
      window.electronAPI.gitActions.list_config(scope).then((configList) => {
        setconfig(configList);
        console.log(configList); // Affiche la configuration dans la console
      });
    }
  }, [scope]);

  const UpdateGitConfig = (formData) => {
    window.electronAPI.gitActions.config(
      "user.name",
      formData.get("username"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "user.email",
      formData.get("email"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "init.defaultBranch",
      formData.get("defaultBranch"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "pull.rebase",
      formData.get("pullRebase"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "rebase.autoStash",
      formData.get("rebaseAutoStash"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "push.autoSetupRemote",
      formData.get("pushAutoSetupRemote"),
      scope,
    );

    window.electronAPI.gitActions.config(
      "color.ui",
      formData.get("colorUI"),
      scope,
    );
  };

  return (
    <>
      <div className="GitCthulhuMain">
        <h1 style={{ "text-align": "center" }}>Config</h1>
        <form action={UpdateGitConfig}>
          {/*User informations*/}
          <div class="input-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              defaultValue={config["user.name"]}
            />

            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={config["user.email"]}
            />
          </div>

          {/*Base command config*/}
          <div class="input-group">
            <label for="defaultBranch">Default Branch</label>
            <input
              type="text"
              id="defaultBranch"
              name="defaultBranch"
              defaultValue={config["init.defaultBranch"]}
            />

            <label for="pullRebase">Pull Rebase</label>
            <select
              id="pullRebase"
              name="pullRebase"
              defaultValue={config["pull.rebase"]}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>

            <label for="rebaseAutoStash">Rebase Auto Stash</label>
            <select
              id="rebaseAutoStash"
              name="rebaseAutoStash"
              defaultValue={config["rebase.autoStash"]}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>

            <label for="pushAutoSetupRemote">Push Auto Setup Remote</label>
            <select
              id="pushAutoSetupRemote"
              name="pushAutoSetupRemote"
              defaultValue={config["push.autoSetupRemote"]}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          </div>

          {/*Configuration du terminal*/}
          <div class="input-group">
            <label for="colorUI">Color UI</label>
            <select
              id="colorUI"
              name="colorUI"
              defaultValue={config["color.ui"]}
            >
              <option value="auto">Auto</option>
              <option value="always">Always</option>
              <option value="never">Never</option>
            </select>
          </div>
        </form>
      </div>
      <div class="GitCthulhuFoot">
        <button
          className="outlined contrast"
          onClick={() => {
            window.electronAPI.openConfigFile();
          }}
        >
          Edit file
        </button>
        <div class="mainOperations">
          <button
            class="secondary"
            onClick={() => window.electronAPI.closeWindow()}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
