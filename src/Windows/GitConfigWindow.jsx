import React, { use, useEffect, useState } from "react";
import { GitSingleRemote } from "../Components/GitSingleRemote.jsx";
// import "../public/scss/extras.scss";
// import "../public/scss/style.scss";
// import "../public/scss/SelectorStyle.scss";

export default function GitConfigWindow() {
  const [scope, setScope] = useState("");
  const [config, setconfig] = useState({});
  const [pullRebaseValue, setPullRebaseValue] = useState("");
  const [rebaseAutoStashValue, setRebaseAutoStashValue] = useState("");
  const [pushAutoSetupRemoteValue, setPushAutoSetupRemoteValue] = useState("");
  const [colorUIValue, setColorUIValue] = useState("");

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

        if (configList["pull.rebase"]) {
          setPullRebaseValue(configList["pull.rebase"].toLowerCase());
        }
        if (configList["rebase.autoStash"]) {
          setRebaseAutoStashValue(configList["rebase.autoStash"].toLowerCase());
        }
        if (configList["push.autoSetupRemote"]) {
          setPushAutoSetupRemoteValue(
            configList["push.autoSetupRemote"].toLowerCase(),
          );
        }
        if (configList["color.ui"]) {
          setColorUIValue(configList["color.ui"].toLowerCase());
        }
      });
    }
  }, [scope]);

  const UpdateGitConfig = (formData) => {
    if (config["user.name"] !== formData.get("username")) {
      if (formData.get("username") === "") {
        window.electronAPI.gitActions.del_config("user.name", scope);
      } else {
        window.electronAPI.gitActions.config(
          "user.name",
          formData.get("username"),
          scope,
        );
      }
    }

    if (config["user.email"] !== formData.get("email")) {
      if (formData.get("email") === "") {
        window.electronAPI.gitActions.del_config("user.email", scope);
      } else {
        window.electronAPI.gitActions.config(
          "user.email",
          formData.get("email"),
          scope,
        );
      }
    }

    if (config["init.defaultBranch"] !== formData.get("defaultBranch")) {
      window.electronAPI.gitActions.config(
        "init.defaultBranch",
        formData.get("defaultBranch"),
        scope,
      );
    }

    if (config["pull.rebase"] !== pullRebaseValue) {
      window.electronAPI.gitActions.config(
        "pull.rebase",
        pullRebaseValue,
        scope,
      );
    }

    if (config["rebase.autoStash"] !== rebaseAutoStashValue) {
      window.electronAPI.gitActions.config(
        "rebase.autoStash",
        rebaseAutoStashValue,
        scope,
      );
    }

    if (config["push.autoSetupRemote"] !== pushAutoSetupRemoteValue) {
      window.electronAPI.gitActions.config(
        "push.autoSetupRemote",
        pushAutoSetupRemoteValue,
        scope,
      );
    }

    if (config["color.ui"] !== colorUIValue) {
      window.electronAPI.gitActions.config("color.ui", colorUIValue, scope);
    }

    window.location.reload(true);
  };

  return (
    <>
      <form action={UpdateGitConfig}>
        <div className="GitCthulhuMain">
          <h1 style={{ "text-align": "center" }}>Config</h1>
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
              defaultValue={config["init.defaultbranch"]}
            />

            <label for="pullRebase">Pull Rebase</label>
            <select
              id="pullRebase"
              name="pullRebase"
              value={pullRebaseValue}
              onChange={(e) => {
                const options = [...e.target.selectedOptions];
                const values = options.map((option) => option.value);
                setPullRebaseValue(values);
              }}
            >
              <option hiden value=""></option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>

            <label for="rebaseAutoStash">Rebase Auto Stash</label>
            <select
              id="rebaseAutoStash"
              name="rebaseAutoStash"
              value={rebaseAutoStashValue}
              onChange={(e) => {
                const options = [...e.target.selectedOptions];
                const values = options.map((option) => option.value);
                setRebaseAutoStashValue(values);
              }}
            >
              <option hiden value=""></option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>

            <label for="pushAutoSetupRemote">Push Auto Setup Remote</label>
            <select
              id="pushAutoSetupRemote"
              name="pushAutoSetupRemote"
              value={pushAutoSetupRemoteValue}
              onChange={(e) => {
                const options = [...e.target.selectedOptions];
                const values = options.map((option) => option.value);
                setPushAutoSetupRemoteValue(values);
              }}
            >
              <option hiden value=""></option>
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
              value={colorUIValue}
              onChange={(e) => {
                const options = [...e.target.selectedOptions];
                const values = options.map((option) => option.value);
                setColorUIValue(values);
              }}
            >
              <option hiden value=""></option>
              <option value="auto">Auto</option>
              <option value="always">Always</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
        <div class="GitCthulhuFoot">
          <button
            type="button"
            style={{
              "margin-top": "0.2%",
              "margin-bottom": "0px",
            }}
            className="outlined contrast"
            onClick={() => {
              window.electronAPI.openConfigFile();
            }}
          >
            Edit file
          </button>
          <div class="mainOperations">
            <button
              style={{ "margin-bottom": "0px" }}
              type="submit"
              class="primary"
            >
              Apply
            </button>
            <button
              class="secondary"
              onClick={() => window.electronAPI.closeWindow()}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
