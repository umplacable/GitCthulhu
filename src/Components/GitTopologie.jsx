import React, { useMemo, useState } from "react";

const COLORS = [
  "#ff6b6b",
  "#4dabf7",
  "#51cf66",
  "#fcc419",
  "#b197fc",
  "#f783ac",
  "#20c997",
  "#ffa94d",
];
const HASH_COLOR = "#20c997";

const GRAPH_CHARS = new Set(["|", "/", "\\", "*"]);
const HASH_RE = /\b([0-9a-f]{7})\b/;

export default function GitTopologie({ ascii }) {
  const asciiMap = useMemo(
    () =>
      ascii
        .split("\n")
        .map((l) => l.replace(/\r/g, ""))
        .filter(Boolean),
    [ascii],
  );

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
          renderedGraph.push({
            char,
            color: "#c9d1d9",
          });
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
        }

        if (char === "*") {
          branchColor = color;
        }

        renderedGraph.push({
          char,
          color,
        });
      }

      previousLanes = currentLanes;

      return {
        graph: renderedGraph,
        hash,
        info: infoPart,
        branchColor,
      };
    });
  }, [asciiMap]);

  return (
    <div
      style={{
        overflow: "auto",
        background: "#0d1117",
        borderRadius: 12,
        padding: 12,
        fontFamily: "monospace",
        whiteSpace: "pre",
      }}
    >
      {parsedLines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Graphe */}
          <div style={{ minWidth: 200, fontStyle: "bold" }}>
            {line.graph.map((c, j) => (
              <span
                key={j}
                style={{
                  color: c.color || "#c9d1d9",
                  fontWeight: c.char === "*" ? 700 : 400,
                }}
              >
                {`${c.char} `}
              </span>
            ))}
          </div>

          {/* Hash coloré */}
          {line.hash && (
            <span
              style={{
                color: HASH_COLOR,
                fontWeight: 700,
                marginRight: 10,
              }}
            >
              {line.hash}
            </span>
          )}

          {
            /* Infos commit */
            line.info || line.info !== "" ? (
              <section style={{ margin: "0px", "white-space": "pre-wrap" }}>
                <span style={{ color: "#3b8eea" }}>
                  {line.info.split(")")[0].slice(2)}
                  {")"}
                </span>
                <span style={{ color: "#c9d1d9" }}>
                  {line.info.split(")")[1].split("#=cthulhu=#")[0]}
                </span>
                <span style={{ color: "#949494" }}>
                  {line.info.split("#=cthulhu=#")[1].split("(")[0]}
                </span>
                {line.info.split("#=cthulhu=#")[1].split("(")[1] ? (
                  <span style={{ color: "#e5e510" }}>
                    {"("}
                    {line.info
                      .split("#=cthulhu=#")[1]
                      .split("(")[1]
                      .substring(
                        0,
                        line.info.split("#=cthulhu=#")[1].split("(")[1].length -
                          2,
                      )
                      .split(",")
                      .map((elt, index) => {
                        let coma = index == 0 ? "" : ", ";

                        console.log(`${coma}${elt.trim()}`);

                        if (elt.includes("/")) {
                          return (
                            <span
                              style={{ color: "#dc4242" }}
                            >{`${coma}${elt.trim()}`}</span>
                          );
                        }
                        if (elt.includes("tag:")) {
                          return `${coma}${elt.trim()}`;
                        } else {
                          return (
                            <span
                              style={{ color: "#23d18b" }}
                            >{`${coma}${elt.trim()}`}</span>
                          );
                        }
                      })}
                    {")"}
                  </span>
                ) : (
                  ""
                )}
              </section>
            ) : (
              ""
            )
          }
        </div>
      ))}
    </div>
  );
}
