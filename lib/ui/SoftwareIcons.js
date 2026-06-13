function SoftwareSvg({ size, children, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function PaperIcon({ size = 20 }) {
  return (
    <SoftwareSvg size={size}>
      <path fill="none" d="M0 0h24v24H0z" />
      <path fill="none" stroke="currentColor" strokeWidth="2" d="m12 18 6 2 3-17L2 14l6 2" />
      <path stroke="currentColor" strokeWidth="2" d="m9 21-1-5 4 2-3 3Z" />
      <path fill="currentColor" d="m12 18-4-2 10-9-6 11Z" />
    </SoftwareSvg>
  );
}

export function PurpurIcon({ size = 20 }) {
  return (
    <SoftwareSvg size={size}>
      <path fill="none" d="M0 0h24v24H0z" />
      <path fill="none" stroke="currentColor" strokeWidth="1.77" d="m264 29.95-8 4 8 4.42 8-4.42-8-4Z" transform="matrix(1.125 0 0 1.1372 -285 -31.69)" />
      <path fill="none" stroke="currentColor" strokeWidth="1.77" d="m272 38.37-8 4.42-8-4.42" transform="matrix(1.125 0 0 1.1372 -285 -31.69)" />
      <path fill="none" stroke="currentColor" strokeWidth="1.77" d="m260 31.95 8 4.21V45" transform="matrix(1.125 0 0 1.1372 -285 -31.69)" />
      <path fill="none" stroke="currentColor" strokeWidth="1.77" d="M260 45v-8.84l8-4.21" transform="matrix(1.125 0 0 1.1372 -285 -31.69)" />
      <path fill="none" stroke="currentColor" strokeWidth="1.68" d="m264 41.95 8-4v8l-8 4v-8Z" transform="matrix(1.125 0 0 1.2569 -285 -40.78)" />
      <path fill="none" stroke="currentColor" strokeWidth="1.68" d="m264 41.95 8-4v8l-8 4v-8Z" transform="matrix(-1.125 0 0 1.2569 309 -40.78)" />
    </SoftwareSvg>
  );
}

export function VelocityIcon({ size = 20 }) {
  return (
    <SoftwareSvg size={size} className="env-icon-filled">
      <path d="m7.623 6.719-4.752.959a.65.65 0 0 0-.44.324L.083 12.248a.65.65 0 0 0 .045.701l2.986 4.076a.66.66 0 0 0 .657.256l4.736-.957a.65.65 0 0 0 .363-.215h11.694a.542.542 0 0 0 0-1.084h-2.95a.53.53 0 0 1-.394-.152.545.545 0 0 1 0-.78.55.55 0 0 1 .394-.152h5.875a.53.53 0 0 0 .512-.33v-.422a.53.53 0 0 0-.512-.33h-9.79a.547.547 0 0 1-.544-.543.54.54 0 0 1 .543-.54h5.85a.544.544 0 0 0 .525-.542.54.54 0 0 0-.525-.543H15.68a.54.54 0 1 1 0-1.082h5.86a.546.546 0 0 0 .524-.543.54.54 0 0 0-.525-.54H9.416L8.279 6.972a.65.65 0 0 0-.656-.254M7.576 7.77a.527.527 0 0 1 .207.715l-1.451 2.631a.88.88 0 0 0 .059.945L8.1 14.39a.528.528 0 0 1-.854.623l-1.709-2.326a.88.88 0 0 0-.88-.344l-2.897.586a.523.523 0 0 1-.621-.412.525.525 0 0 1 .41-.621l3.14-.635a.9.9 0 0 0 .596-.438l1.576-2.845a.524.524 0 0 1 .715-.206m13.608 2.92a.54.54 0 1 0-.001 1.082.54.54 0 0 0 0-1.082" />
    </SoftwareSvg>
  );
}

export function WaterfallIcon({ size = 20 }) {
  return (
    <SoftwareSvg size={size}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
      />
    </SoftwareSvg>
  );
}

export const SOFTWARE_ICONS = {
  paper: PaperIcon,
  purpur: PurpurIcon,
  velocity: VelocityIcon,
  waterfall: WaterfallIcon,
};
