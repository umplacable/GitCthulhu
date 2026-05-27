import React, { useEffect, useMemo, useState } from "react";

// ── Palette de couleurs style GitKraken ───────────────────────────────────────
const COLORS = [
  "#4dabf7", // bleu
  "#51cf66", // vert
  "#fcc419", // jaune
  "#f783ac", // rose
  "#b197fc", // violet
  "#ff6b6b", // rouge
  "#20c997", // turquoise
  "#ffa94d", // orange
  "#74c0fc", // bleu clair
  "#a9e34b", // vert lime
  "#e599f7", // lilas
  "#ff8787", // saumon
];

const HASH_COLOR = "#20c997";
const GRAPH_CHARS = new Set(["|", "/", "\\", "*", "_"]);
const HASH_RE = /\b([0-9a-f]{7})\b/;

// ── Dimensions du graphe SVG par ligne ───────────────────────────────────────
const ROW_H = 36; // hauteur d'une ligne (px) — doit correspondre à la hauteur CSS de chaque row
const COL_W = 16; // largeur d'une "colonne" ASCII → piste de branche
const NODE_R = 5; // rayon du nœud commit
const PAD_L = 6; // padding gauche dans le SVG

// ── Parsing des refs décorées (HEAD, branches locales, remotes, tags) ─────────
function parseRefLabels(rawRefs) {
  // rawRefs ex: " (HEAD -> main, origin/main, tag: v1.0)"
  if (!rawRefs) return [];
  // On strip les parenthèses extérieures si présentes
  const inner = rawRefs
    .replace(/^\s*\(/, "")
    .replace(/\)\s*$/, "")
    .trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => {
      if (r === "HEAD") return { label: "HEAD", kind: "head" };
      if (r.startsWith("HEAD -> ")) return { label: r.slice(8), kind: "local" };
      if (r.startsWith("tag: ")) return { label: r.slice(5), kind: "tag" };
      if (r.includes("/")) return { label: r, kind: "remote" };
      return { label: r, kind: "local" };
    });
}

// ── Style d'un badge selon son type ──────────────────────────────────────────
function badgeColors(kind) {
  switch (kind) {
    case "head":
      return { bg: "#c9a800", fg: "#0d1117", border: "#e5c100" };
    case "local":
      return { bg: "#1a6640", fg: "#a3f7c7", border: "#23d18b" };
    case "remote":
      return { bg: "#5a1a1a", fg: "#ffaaaa", border: "#dc4242" };
    case "tag":
      return { bg: "#3a1f5a", fg: "#d4aaff", border: "#9b59b6" };
    default:
      return { bg: "#2d2d2d", fg: "#cccccc", border: "#555" };
  }
}

// ── Badge de référence ────────────────────────────────────────────────────────
function RefBadge({ label, kind }) {
  const c = badgeColors(kind);
  const icon =
    kind === "head"
      ? "◉ "
      : kind === "local"
        ? "⎇ "
        : kind === "remote"
          ? "↑ "
          : "🏷 ";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        borderRadius: 3,
        fontSize: "0.66rem",
        fontWeight: 700,
        padding: "1px 6px",
        marginRight: 4,
        whiteSpace: "nowrap",
        fontFamily: "monospace",
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Rendu SVG d'une ligne du graphe ──────────────────────────────────────────
// On reçoit `chars` = tableau { char, color } de la partie graphe de la ligne courante
// et `prevChars` de la ligne précédente pour pouvoir tracer les connexions entre lignes.
// Le SVG couvre UNE seule ligne : hauteur ROW_H, largeur = nb_cols * COL_W + PAD_L*2
function GraphLineSVG({ chars, prevChars, nextChars, width }) {
  const h = ROW_H;
  const midY = h / 2;

  // Position X du centre d'une colonne
  const cx = (col) => PAD_L + col * COL_W + COL_W / 2;

  const paths = [];
  const nodes = [];

  chars.forEach(({ char, color }, col) => {
    if (char === " " || !GRAPH_CHARS.has(char)) return;

    const x = cx(col);

    if (char === "|") {
      // Ligne verticale : de haut à bas
      paths.push(
        <line
          key={`v${col}`}
          x1={x}
          y1={0}
          x2={x}
          y2={h}
          stroke={color}
          strokeWidth={2}
        />,
      );
    } else if (char === "*") {
      // Nœud commit : ligne verticale + cercle
      // Ligne du haut (si un "|" était là avant)
      const prevHere = prevChars && prevChars[col];
      const prevHere0 = prevChars && prevChars[col - 1];
      const prevHere2 = prevChars && prevChars[col + 1];
      if (
        (prevHere && prevHere.char !== " ") ||
        (prevHere0 && prevHere0.char === "\\") ||
        (prevHere2 && prevHere2.char === "/")
      ) {
        paths.push(
          <line
            key={`vt${col}`}
            x1={x}
            y1={0}
            x2={x}
            y2={midY}
            stroke={color}
            strokeWidth={2}
          />,
        );
      }
      // Ligne vers le bas (la prochaine ligne aura quelque chose ici)
      paths.push(
        <line
          key={`vb${col}`}
          x1={x}
          y1={midY}
          x2={x}
          y2={h}
          stroke={color}
          strokeWidth={2}
        />,
      );
      // Cercle du commit
      nodes.push(
        <g key={`node${col}`}>
          <circle
            cx={x}
            cy={midY}
            r={NODE_R + 3}
            fill={color}
            fillOpacity={0.18}
          />
          <circle
            cx={x}
            cy={midY}
            r={NODE_R}
            fill={color}
            stroke="#0d1117"
            strokeWidth={1.5}
          />
          <circle
            cx={x}
            cy={midY}
            r={NODE_R * 0.4}
            fill="#fff"
            fillOpacity={0.9}
          />
        </g>,
      );
    } else if (char === "/") {
      // Branche qui rejoint depuis la droite (col+1) vers (col) en montant
      // Courbe bézier du bas-droite vers haut-gauche
      const prevHere = prevChars && prevChars[col - 1];
      const nextHere = nextChars && nextChars[col + 1];

      let x0 = cx(col - 1);
      let x2 = cx(col + 1);

      if (
        prevHere &&
        prevHere.char == "/" &&
        nextHere &&
        nextHere.char == "/"
      ) {
        paths.push(
          <line
            key={`v${col}`}
            x1={x}
            y1={0}
            x2={x}
            y2={h}
            stroke={color}
            strokeWidth={2}
          />,
        );
      } else {
        paths.push(
          <path
            key={`sl${col}`}
            d={`M ${x0} ${h} C ${x0} ${midY}, ${x2} ${midY}, ${x2} ${0}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />,
        );
      }
    } else if (char === "\\") {
      // Branche qui part vers la droite (col, haut) vers (col+1, bas)
      const prevHere = prevChars && prevChars[col - 1];
      const nextHere = nextChars && nextChars[col + 1];

      let x0 = cx(col - 1);
      let x2 = cx(col + 1);

      if (
        prevHere &&
        prevHere.char == "\\" &&
        nextHere &&
        nextHere.char == "\\"
      ) {
        paths.push(
          <line
            key={`v${col}`}
            x1={x}
            y1={0}
            x2={x}
            y2={h}
            stroke={color}
            strokeWidth={2}
          />,
        );
      } else {
        paths.push(
          <path
            key={`bs${col}`}
            d={`M ${x0} ${0} C ${x0} ${midY}, ${x2} ${midY}, ${x2} ${h}`}
            stroke={color}
            strokeWidth={2}
            fill="none"
          />,
        );
      }
    } else if (char === "_") {
      let x0 = cx(col - 1);
      let x2 = cx(col + 1);
      paths.push(
        <line
          key={`vt${col}`}
          x1={x0}
          y1={h - 1}
          x2={x2}
          y2={h - 1}
          stroke={color}
          strokeWidth={2}
        />,
      );
    }
  });
  return (
    <svg width={width} height={h} style={{ display: "block", flexShrink: 0 }}>
      {paths}
      {nodes}
    </svg>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function GitTopologie({ ascii }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  const asciiMap = useMemo(
    () =>
      (ascii || "")
        .split("\n")
        .map((l) => l.replace(/\r/g, ""))
        .filter(Boolean),
    [ascii],
  );

  // Parse chaque ligne : partie graphe colorée + hash + infos commit
  const parsedLines = useMemo(() => {
    let previousLanes = [];
    let nextColorIndex = 0;

    return asciiMap.map((line) => {
      const splited = line.split("'");
      const hashMatch = line.match(HASH_RE);

      let graphPart = splited[0].trim();
      let hash = "";
      let infoPart = "";

      if (hashMatch) {
        const idx = hashMatch.index;
        hash = hashMatch[1];
        infoPart = line.slice(idx + hash.length);
      }

      const chars = [...graphPart];
      const currentLanes = [];
      const renderedGraph = [];
      let branchColor = "#c9d1d9";

      for (let col = 0; col < chars.length; col++) {
        const char = chars[col];

        if (!GRAPH_CHARS.has(char) || char === " ") {
          renderedGraph.push({ char, color: "#c9d1d9" });
          continue;
        }

        let color;
        if (char === "|" || char === "*") {
          color =
            previousLanes[col] ?? COLORS[nextColorIndex++ % COLORS.length];
          currentLanes[col] = color;
        } else if (char === "/") {
          color =
            previousLanes[col + 1] ?? COLORS[nextColorIndex++ % COLORS.length];
          currentLanes[col] = color;
        } else if (char === "\\") {
          color =
            previousLanes[col - 1] ?? COLORS[nextColorIndex++ % COLORS.length];
          currentLanes[col] = color;
        } else if (char === "_") {
          color = "#c9d1d9";
        }
        if (char === "*") branchColor = color;
        renderedGraph.push({ char, color });
      }

      previousLanes = currentLanes;
      return {
        graph: renderedGraph,
        hash,
        info: infoPart,
        branchColor,
        graphWidth: chars.length * COL_W + PAD_L * 2,
      };
    });
  }, [asciiMap]);

  // Largeur max du graphe SVG (pour que toutes les lignes aient la même largeur)
  const maxGraphWidth = useMemo(
    () => Math.max(80, ...parsedLines.map((l) => l.graphWidth)),
    [parsedLines],
  );

  // ── Légende : couleur de piste → noms de branches ─────────────────────────
  // On associe chaque couleur de piste (`branchColor`) aux labels de refs
  // trouvés sur les commits situés sur cette piste.
  const legend = useMemo(() => {
    const colorToLabels = new Map(); // color → Set<label>

    parsedLines.forEach((line) => {
      if (!line.hash || !line.info) return;

      // Même parsing que dans le rendu
      const parts = line.info.split("#=cthulhu=#");
      if (!parts[1]) return;

      const authorRefPart = parts[1];
      const refsMatch = authorRefPart.match(/\(([^)]+)\)\s*$/);
      if (!refsMatch) return;

      const refs = parseRefLabels(refsMatch[1]);
      if (!refs.length) return;

      const color = line.branchColor;
      if (!colorToLabels.has(color)) colorToLabels.set(color, new Set());
      refs.forEach(({ label, kind }) => {
        // On exclut HEAD seul (pas de nom de branche utile)
        if (kind !== "head") colorToLabels.get(color).add({ label, kind });
      });
    });

    // On transforme en tableau ordonné (ordre d'apparition dans le graphe)
    const seenColors = [];
    parsedLines.forEach((line) => {
      if (
        line.hash &&
        colorToLabels.has(line.branchColor) &&
        !seenColors.includes(line.branchColor)
      ) {
        seenColors.push(line.branchColor);
      }
    });

    return seenColors
      .map((color) => ({ color, refs: [...colorToLabels.get(color)] }))
      .filter((entry) => entry.refs.length > 0);
  }, [parsedLines]);

  return (
    <div
      style={{
        overflow: "auto",
        background: "#0d1117",
        height: "100%",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* En-tête colonnes */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "5px 10px 5px 0",
          borderBottom: "1px solid rgba(136,207,182,0.15)",
          background: "rgba(13,17,23,0.98)",
          position: "sticky",
          top: 0,
          zIndex: 2,
          fontSize: "0.68rem",
          color: "#484f58",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          userSelect: "none",
        }}
      >
        <span
          style={{ width: maxGraphWidth, flexShrink: 0, paddingLeft: PAD_L }}
        >
          Graph
        </span>
        <span style={{ flex: 2, paddingLeft: 8 }}>Message</span>
        <span
          style={{
            width: 80,
            textAlign: "right",
            paddingRight: 12,
            color: "#484f58",
          }}
        >
          Hash
        </span>
      </div>

      {/* ── Barre de légende ─────────────────────────────────────────────── */}
      {legend.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px 14px",
            padding: "6px 12px",
            borderBottom: "1px solid rgba(136,207,182,0.10)",
            background: "rgba(13,17,23,0.92)",
            position: "sticky",
            top: 29, // juste sous l'en-tête
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "0.62rem",
              color: "#484f58",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 600,
              flexShrink: 0,
              paddingRight: 4,
            }}
          >
            Branches :
          </span>
          {legend.map(({ color, refs }, li) => (
            <span
              key={li}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {/* Pastille de couleur de la piste */}
              <svg width={12} height={12} style={{ flexShrink: 0 }}>
                <circle
                  cx={6}
                  cy={6}
                  r={4.5}
                  fill={color}
                  stroke="#0d1117"
                  strokeWidth={1}
                />
                <circle cx={6} cy={6} r={1.8} fill="#fff" fillOpacity={0.85} />
              </svg>
              {/* Labels des refs associées à cette couleur */}
              {refs.map(({ label, kind }, ri) => {
                const c = badgeColors(kind);
                return (
                  <span
                    key={ri}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      background: c.bg,
                      color: c.fg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 3,
                      fontSize: "0.63rem",
                      fontWeight: 700,
                      padding: "0px 5px",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </span>
          ))}
        </div>
      )}

      {/* Lignes de commits */}
      {parsedLines.map((line, i) => {
        const isHovered = hoveredRow === i;
        const hasCommit = !!line.hash;

        // Parse les refs depuis la partie info du commit
        // Format: " - author(refs)" après le séparateur #=cthulhu=#
        let refs = [];
        let message = "";
        let author = "";
        let dateRel = "";

        if (line.info) {
          // dateRel : le truc entre le premier "(" et premier ")"
          const dateMatch = line.info.match(/^\s*-\s*\(([^)]+)\)/);
          if (dateMatch) dateRel = dateMatch[1];

          // message : entre le ")" de la date et "#=cthulhu=#"
          const afterDate = line.info.split(")")[1] || "";
          const parts = afterDate.split("#=cthulhu=#");
          message = parts[0]?.trim() || "";

          // author + refs après le séparateur
          if (parts[1]) {
            const authorRefPart = parts[1];
            const refsMatch = authorRefPart.match(/\(([^)]+)\)\s*$/);
            if (refsMatch) {
              refs = parseRefLabels(refsMatch[1]);
              author = authorRefPart
                .slice(0, refsMatch.index)
                .replace(/^[-\s]+/, "")
                .trim();
            } else {
              author = authorRefPart.replace(/^[-\s]+/, "").trim();
            }
          }
        }

        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredRow(i)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              display: "flex",
              alignItems: "center",
              height: ROW_H,
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              background: isHovered
                ? "rgba(255,255,255,0.06)"
                : i % 2 === 0
                  ? "rgba(255,255,255,0.01)"
                  : "transparent",
              transition: "background 0.1s",
              cursor: "default",
            }}
          >
            {/* ── Colonne SVG graphe ── */}
            <div style={{ width: maxGraphWidth, flexShrink: 0 }}>
              <GraphLineSVG
                chars={line.graph}
                prevChars={i > 0 ? parsedLines[i - 1].graph : null}
                nextChars={
                  i < parsedLines.length - 1 ? parsedLines[i + 1].graph : null
                }
                width={maxGraphWidth}
              />
            </div>

            {/* ── Colonne message + badges ── */}
            <div
              style={{
                flex: 2,
                paddingLeft: 8,
                paddingRight: 8,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 4,
                minWidth: 0,
              }}
            >
              {/* Badges de références */}
              {refs.map((r, ri) => (
                <RefBadge key={ri} label={r.label} kind={r.kind} />
              ))}

              {hasCommit ? (
                <div style={{ overflow: "hidden", minWidth: 0 }}>
                  {/* Message principal */}
                  <span
                    style={{
                      color: isHovered ? "#e6edf3" : "#c9d1d9",
                      fontSize: "0.82rem",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message}
                  </span>
                  {/* Sous-ligne : auteur + date */}
                  {(author || dateRel) && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "#484f58",
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {author && (
                        <span style={{ color: "#6e7681" }}>{author}</span>
                      )}
                      {author && dateRel && (
                        <span style={{ margin: "0 4px", color: "#333c47" }}>
                          ·
                        </span>
                      )}
                      {dateRel && (
                        <span style={{ color: "#484f58" }}>{dateRel}</span>
                      )}
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            {/* ── Colonne hash ── */}
            {line.hash ? (
              <span
                style={{
                  width: 80,
                  flexShrink: 0,
                  textAlign: "right",
                  paddingRight: 12,
                  color: isHovered ? HASH_COLOR : "#333c47",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  transition: "color 0.1s",
                }}
              >
                {line.hash}
              </span>
            ) : (
              <span style={{ width: 80, flexShrink: 0 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
