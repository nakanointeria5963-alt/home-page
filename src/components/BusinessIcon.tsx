export type BusinessIconName =
  | "app"
  | "music"
  | "film"
  | "pen"
  | "shirt"
  | "cycle";

type BusinessIconProps = {
  name: BusinessIconName;
  className?: string;
};

// 絵文字は端末ごとに絵が変わるので、ブランドの線で描いた自前のアイコンを使う
const PATHS: Record<BusinessIconName, React.ReactNode> = {
  app: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M10 18.5h4" />
    </>
  ),
  music: (
    <>
      <circle cx="6.5" cy="17.5" r="3" />
      <circle cx="17.5" cy="15.5" r="3" />
      <path d="M9.5 17.5V6l11-2v11.5" />
    </>
  ),
  film: (
    <>
      <rect x="2" y="6" width="14" height="12" rx="2.5" />
      <path d="M16 11l6-3.2v8.4L16 13z" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20l3-8 9-9 5 5-9 9-8 3z" />
      <path d="M13 6l5 5" />
    </>
  ),
  shirt: <path d="M9 3.5l3 2 3-2 5.5 3-2 4.2-2-1V21H7.5V9.7l-2 1-2-4.2z" />,
  cycle: (
    <>
      <path d="M4.5 13a7.5 7.5 0 0 1 12.4-5.7" />
      <path d="M19.5 11a7.5 7.5 0 0 1-12.4 5.7" />
      <path d="M14 6.4l3.2.6-.5 3.2" />
      <path d="M10 17.6l-3.2-.6.5-3.2" />
    </>
  ),
};

export default function BusinessIcon({ name, className }: BusinessIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
