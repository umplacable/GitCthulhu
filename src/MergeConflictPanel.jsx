import React, { useEffect, useState } from "react";

export default function MergeConflictPanel() {
  const [conflictedFiles, setConflictedFiles] = useState([]);
  const [loadingFile, setLoadingFile] = useState(null);
  const [mergeError, setMergeError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const status = await window.electronAPI.gitActions.status();
        if (cancelled || !status) return;

        const conflicted = status.conflicted || [];
        setConflictedFiles(conflicted);
      } catch (e) {
        if (!cancelled) {
          console.error(
            "Erreur lors de la récupération du status pour les conflits",
            e
          );
        }
      }
    };

    // premier fetch
    fetchStatus();
    // rafraîchissement régulier
    const id = setInterval(fetchStatus, 1000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!conflictedFiles || conflictedFiles.length === 0) {
    return null;
  }

  const handleAutoSolve = async (file) => {
    setLoadingFile(file);
    setMergeError(null);
    try {
      const res = await window.electronAPI.gitActions.autoSolveMergeFile(file);
      if (!res || !res.ok) {
        setMergeError(
          res?.reason === "unresolved-conflicts"
            ? `Impossible de tout résoudre automatiquement pour ${file} (conflits restants).`
            : `Auto-résolution échouée pour ${file}: ${
                res?.error || "erreur inconnue"
              }`
        );
      }
    } catch (e) {
      setMergeError(
        `Erreur lors de l'auto-résolution pour ${file}: ${
          e.message || e.toString()
        }`
      );
    } finally {
      setLoadingFile(null);
    }
  };

  const handleStrategy = async (file, strategy) => {
    setLoadingFile(file);
    setMergeError(null);
    try {
      const res =
        await window.electronAPI.gitActions.resolveMergeFileWithStrategy(
          file,
          strategy
        );
      if (!res || !res.ok) {
        setMergeError(
          `Échec de la résolution (${strategy}) pour ${file}: ${
            res?.error || "erreur inconnue"
          }`
        );
      }
    } catch (e) {
      setMergeError(
        `Erreur lors de la résolution (${strategy}) pour ${file}: ${
          e.message || e.toString()
        }`
      );
    } finally {
      setLoadingFile(null);
    }
  };

  return (
    <section className="MergeConflictPanel">
      <header className="MergeConflictPanel__header">
        <strong>Conflits de merge en cours</strong>
        <span>
          {" "}
          ({conflictedFiles.length} fichier
          {conflictedFiles.length > 1 ? "s" : ""} en conflit)
        </span>
      </header>

      {mergeError && (
        <p className="MergeConflictPanel__error">{mergeError}</p>
      )}

      <ul className="MergeConflictPanel__list">
        {conflictedFiles.map((file) => (
          <li key={file} className="MergeConflictPanel__item">
            <span className="MergeConflictPanel__file">{file}</span>
            <div className="MergeConflictPanel__actions">
              <button
                className="secondary"
                disabled={loadingFile === file}
                onClick={() => handleAutoSolve(file)}
              >
                {loadingFile === file
                  ? "Auto-résolution…"
                  : "Auto-résoudre (smart)"}
              </button>
              <button
                disabled={loadingFile === file}
                onClick={() => handleStrategy(file, "ours")}
              >
                Garder notre version
              </button>
              <button
                disabled={loadingFile === file}
                onClick={() => handleStrategy(file, "theirs")}
              >
                Garder leur version
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="MergeConflictPanel__hint">
        Une fois tous les fichiers résolus, terminez le merge avec un commit
        (par exemple via le bouton Commit).
      </p>
    </section>
  );
}
