import React, { useEffect, useState } from "react";

export default function GitMergeConflictWindow() {
  const [conflicts, setConflicts] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [versions, setVersions] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [resolvedFiles, setResolvedFiles] = useState([]);
  const [loadingConflicts, setLoadingConflicts] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [aborting, setAborting] = useState(false);

  // Chargement initial des conflits
  useEffect(() => {
    (async () => {
      const data = await window.electronAPI.gitActions.getMergeConflicts();
      setConflicts(data);
      setLoadingConflicts(false);
    })();
  }, []);

  // Chargement des versions quand le fichier courant change
  useEffect(() => {
    if (!conflicts || conflicts.files.length === 0) return;
    const filepath = conflicts.files[currentIndex];
    if (!filepath) return;

    setVersions(null);
    setLoadingVersions(true);
    (async () => {
      const data =
        await window.electronAPI.gitActions.getMergeVersions(filepath);
      setVersions(data);
      setLoadingVersions(false);
    })();
  }, [currentIndex, conflicts]);

  const resolveConflict = async (choice) => {
    if (!conflicts || !versions) return;
    const filepath = conflicts.files[currentIndex];
    const content = choice === "ours" ? versions.ours : versions.theirs;

    const result = await window.electronAPI.gitActions.resolveConflict(
      filepath,
      content,
    );
    if (result.success) {
      const newResolved = [...resolvedFiles, filepath];
      setResolvedFiles(newResolved);
      // Passer au fichier suivant non résolu
      const nextUnresolved = conflicts.files.findIndex(
        (f, i) => i > currentIndex && !newResolved.includes(f),
      );
      if (nextUnresolved !== -1) {
        setCurrentIndex(nextUnresolved);
      }
    }
  };

  const completeMerge = async () => {
    setCompleting(true);
    const result = await window.electronAPI.gitActions.completeMerge();
    setCompleting(false);
    if (result.success) {
      window.electronAPI.closeWindow();
    }
  };

  const abortMerge = async () => {
    setAborting(true);
    const result = await window.electronAPI.gitActions.abortMerge();
    setAborting(false);
    if (result.success) {
      window.electronAPI.closeWindow();
    }
  };

  const allResolved =
    conflicts && resolvedFiles.length >= conflicts.files.length;
  const currentFile = conflicts ? conflicts.files[currentIndex] : null;
  const isCurrentResolved = currentFile && resolvedFiles.includes(currentFile);

  return (
    <>
      {loadingConflicts ? (
        <div className="conflict-loading">
          <span aria-busy="true">Chargement des conflits...</span>
        </div>
      ) : (
        <>
          {!conflicts || conflicts.files.length === 0 ? (
            <div className="conflict-loading">
              <p>Aucun conflit détecté.</p>
              <button onClick={() => window.electronAPI.closeWindow()}>
                Fermer
              </button>
            </div>
          ) : (
            <div className="conflict-root" key="conflict-root">
              {/* En-tête */}
              <div className="conflict-header">
                <div className="conflict-header-info">
                  <h4>🔀 Résolution de conflits</h4>
                  <p className="conflict-subtitle">
                    Merge de <strong>"{conflicts.branch}"</strong> —{" "}
                    <span
                      className={
                        allResolved ? "resolved-count-done" : "resolved-count"
                      }
                    >
                      {resolvedFiles.length}/{conflicts.files.length} fichier(s)
                      résolu(s)
                    </span>
                  </p>
                </div>
                <div className="conflict-header-actions">
                  <button
                    className="conflict-abort-btn"
                    onClick={abortMerge}
                    aria-busy={aborting}
                    disabled={aborting || completing}
                  >
                    ✕ Annuler le merge
                  </button>
                  {allResolved && (
                    <button
                      className="conflict-complete-btn"
                      onClick={completeMerge}
                      aria-busy={completing}
                      disabled={completing || aborting}
                    >
                      ✓ Compléter le merge
                    </button>
                  )}
                </div>
              </div>

              {/* Liste des fichiers en conflit */}
              <div className="conflict-file-tabs">
                {conflicts.files.map((file, index) => {
                  const isResolved = resolvedFiles.includes(file);
                  const isActive = index === currentIndex;
                  return (
                    <button
                      key={file}
                      className={`conflict-file-tab ${isActive ? "active" : ""} ${isResolved ? "resolved" : ""}`}
                      onClick={() => setCurrentIndex(index)}
                      title={file}
                    >
                      {isResolved ? "✓ " : "⚠ "}
                      {file.split("/").pop()}
                    </button>
                  );
                })}
              </div>

              {/* Zone principale */}
              {allResolved ? (
                <div className="conflict-all-resolved">
                  <p>✅ Tous les conflits ont été résolus.</p>
                  <p>
                    Cliquez sur <strong>"Compléter le merge"</strong> pour
                    finaliser.
                  </p>
                </div>
              ) : (
                <>
                  <div className="conflict-file-path">
                    <span>📄 {currentFile}</span>
                    {isCurrentResolved && (
                      <span className="resolved-badge">✓ Résolu</span>
                    )}
                  </div>

                  {loadingVersions ? (
                    <div className="conflict-loading-versions">
                      <span aria-busy="true">Chargement du fichier...</span>
                    </div>
                  ) : versions ? (
                    <div className="conflict-viewer">
                      {/* Panneau NOTRE VERSION */}
                      <div className="conflict-panel">
                        <div className="conflict-panel-header ours-header">
                          ← NOTRE VERSION (HEAD — branche courante)
                        </div>
                        <pre className="conflict-code">{versions.ours}</pre>
                        <button
                          className="keep-ours-btn"
                          onClick={() => resolveConflict("ours")}
                          disabled={isCurrentResolved}
                        >
                          ✓ Garder notre version
                        </button>
                      </div>

                      <div className="conflict-panel-divider" />

                      {/* Panneau LEUR VERSION */}
                      <div className="conflict-panel">
                        <div className="conflict-panel-header theirs-header">
                          VERSION À MERGER ({conflicts.branch}) →
                        </div>
                        <pre className="conflict-code">{versions.theirs}</pre>
                        <button
                          className="keep-theirs-btn"
                          onClick={() => resolveConflict("theirs")}
                          disabled={isCurrentResolved}
                        >
                          ✓ Garder leur version
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="conflict-loading-versions">
                      <span>Impossible de charger le fichier.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
