/** Original, decorative cloud/circuit artwork. No rewards or progression meaning. */
export function ArcadeArt({ className = "" }: { className?: string }) {
  return (
    <svg className={`arcade-art ${className}`} viewBox="0 0 400 300" fill="none" aria-hidden="true" focusable="false">
      <path d="M36 67h48v28h46M330 45v42h37M36 214h50v-28h36M283 231h34v32h45" stroke="var(--line-strong)" strokeWidth="2" />
      <path d="M88 53h14m-7-7v14M344 176h18m-9-9v18M130 255h12m-6-6v12" stroke="var(--teal)" strokeWidth="2" />
      <rect x="58" y="125" width="9" height="9" fill="var(--coral)" /><rect x="316" y="112" width="7" height="7" fill="var(--violet)" />
      <rect x="96" y="90" width="217" height="150" rx="5" fill="#302b24" />
      <rect x="85" y="77" width="217" height="150" rx="5" fill="var(--surface)" stroke="var(--amber)" strokeWidth="2" />
      <path d="M85 107h217" stroke="var(--amber)" strokeWidth="2" />
      <rect x="98" y="89" width="6" height="6" fill="var(--amber)" /><rect x="110" y="89" width="6" height="6" fill="var(--coral)" /><rect x="122" y="89" width="6" height="6" fill="var(--teal)" />
      <path d="M263 92h24" stroke="var(--amber)" strokeWidth="2" />
      <path d="M157 185h74c20 0 33-12 33-28 0-16-13-29-30-29a42 42 0 0 0-77 6c-16 0-28 11-28 25s12 26 28 26Z" fill="var(--amber)" stroke="var(--amber)" strokeWidth="2" />
      <path d="m174 146-13 13 13 13m42-26 13 13-13 13m-16-32-10 39" stroke="var(--ink)" strokeWidth="3" strokeLinecap="square" />
      <path d="M160 207h67M193 186v21" stroke="var(--amber)" strokeWidth="2" />
      <rect x="267" y="184" width="67" height="60" rx="3" fill="var(--violet)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="279" y="199" width="42" height="11" stroke="var(--ink)" strokeWidth="2" /><rect x="279" y="217" width="42" height="11" stroke="var(--ink)" strokeWidth="2" />
      <path d="M286 205h3m-3 18h3" stroke="var(--ink)" strokeWidth="2" />
      <rect x="56" y="42" width="60" height="48" rx="3" fill="var(--teal)" stroke="var(--ink)" strokeWidth="2" />
      <path d="m71 65 10-8 10 8-10 8zM71 72l10 8 10-8" stroke="var(--ink)" strokeWidth="2" />
      <path d="M259 42h20m-10-10v20" stroke="var(--coral)" strokeWidth="3" />
    </svg>
  );
}
