import React, { useEffect, useState } from "react";
import { openRepo } from "../Windows/createGitCreatorWindow";

// création d'un élément listant les dépôts
function GitList() {
  const [repos, setRepos] = useState([]);
  const [paths, setPaths] = useState([]);
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await window.electronAPI.getConfig();
      const newPaths = config.Depo.paths.split(",").map((x) => x.trim());
      const newRepos = config.Depo.names.split(",").map((x) => x.trim());
      const newKeys = config.Depo.ids.split(",").map((x) => x.trim());
      setRepos(newRepos);
      setPaths(newPaths);
      setKeys(newKeys);
    };
    loadConfig();
  }, []);

  const handleDoubleClick = (item) => {
    openRepo(repos[keys.indexOf(item)], paths[keys.indexOf(item)]);
  };

  const handleClick = (item) => {
    const p = document.getElementsByClassName("repInfo");
    p[0].innerText = "Loading README.md...";

    window.electronAPI.getReadme(paths[keys.indexOf(item)]).then((data) => {
      if (data === null) {
        p[0].innerText = "No README.md found in this repository.";
      } else {
        p[0].innerHTML = data;
      }
    });

    const elements = document.getElementsByClassName("GitCthulhuSelected");
    elements[0]?.classList.replace("GitCthulhuSelected", "GitCthulhu");
    const element = document.getElementById(keys[keys.indexOf(item)]);
    element?.classList.replace("GitCthulhu", "GitCthulhuSelected");
  };

  const handleKeyDown = (e, item) => {
    if (e.key == "Enter" || e.key == " ") {
      const element = document.getElementById(keys[keys.indexOf(item)]);
      element.click();
    }
  };

  return (
    <ul className="GitList">
      {keys.map((item) => (
        <li
          key={item}
          tabIndex="0"
          className="GitCthulhu"
          onDoubleClick={() => handleDoubleClick(item)}
          onClick={() => handleClick(item)}
          onKeyDown={(e) => handleKeyDown(e, item)}
          id={keys[keys.indexOf(item)]}
          value={paths[keys.indexOf(item)]}
        >
          {repos[keys.indexOf(item)]}
          <p className="complement">{paths[keys.indexOf(item)]}</p>
        </li>
      ))}
    </ul>
  );
}

export default GitList;
