import type { PrestationIconName } from "../../config/contenu";

/**
 * Pictogrammes au trait des prestations (dessinés dans la maquette). Les
 * classes `pi-*` portent les animations, jouées au survol de la carte
 * `.prestation` parente (voir index.css).
 */
export function PrestationIcon({ name }: { name: PrestationIconName }) {
  const svg = {
    width: 34,
    height: 34,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { overflow: "visible" as const },
  };

  let drawing;
  if (name === "dumbbell") {
    drawing = (
      <svg {...svg} style={{ overflow: "visible", transform: "rotate(-35deg)" }}>
        <path className="pi-boneL" d="M11 10H6.5A2 2 0 1 0 4.5 12A2 2 0 1 0 6.5 14H11L10 13L11.2 12L10 11Z" />
        <path className="pi-boneR" d="M13 10H17.5A2 2 0 1 1 19.5 12A2 2 0 1 1 17.5 14H13L12 13L13.2 12L12 11Z" />
      </svg>
    );
  } else if (name === "run") {
    drawing = (
      <svg {...svg} strokeWidth={2.2}>
        <g className="pi-speed" strokeWidth={1.4}>
          <path d="M3 8h3.5M1.5 11h3.5M2 15.5h3" />
        </g>
        <g className="pi pi-run">
          <circle cx={14.6} cy={5.6} r={1.9} fill="currentColor" stroke="none" />
          <path d="M13.6 8.6L11.2 13" strokeWidth={3.4} />
          <path d="M13.2 8.4H9.6L7.9 10.4" />
          <path d="M14 9l1.6 3.2 2.9-1.4" />
          <path d="M11.2 13l-2.4 3.4-3.2-1.9" />
          <path d="M11.6 13.2l3.6 2-.4 4.4" />
        </g>
      </svg>
    );
  } else if (name === "pregnant") {
    drawing = (
      <svg {...svg}>
        <g className="pi pi-sway">
          <circle cx={11} cy={4} r={2} />
          <path d="M11 7c-1.4 0-2 1.3-2 3v4h1v7M11 7c1 0 1.6 1 2 2.4 2.2.6 3.4 2.1 3.4 3.6 0 1.6-1.5 2.6-3.6 2.6H12v5.4" />
        </g>
      </svg>
    );
  } else {
    drawing = (
      <svg {...svg}>
        <g className="pi pi-pop">
          <path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-5h4v5" />
        </g>
      </svg>
    );
  }

  return (
    <div aria-hidden className="prestation-icone">
      {drawing}
    </div>
  );
}
