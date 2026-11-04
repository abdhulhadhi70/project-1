// Hairline icons drawn for this site, 1.5px strokes on a 24px grid.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const SearchIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
);
export const HeartIcon = ({ className = "size-5", filled = false }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20s-7.5-4.6-7.5-10.1A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const PinIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>
);
export const ChevronIcon = ({ className = "size-3.5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m6 9 6 6 6-6" /></svg>
);
export const SlidersIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
);
export const CloseIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const ArrowIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 12h15m-5-5 5 5-5 5" /></svg>
);
export const PhoneIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" /></svg>
);
export const ChatIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4.5 19.5 5.7 16A7.8 7.8 0 1 1 8.4 18.6Z" /></svg>
);
export const GridIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><rect x="4" y="4" width="6.5" height="6.5" /><rect x="13.5" y="4" width="6.5" height="6.5" /><rect x="4" y="13.5" width="6.5" height="6.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" /></svg>
);
export const StoreIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 9.5V20h16V9.5M3 9.5 5 4h14l2 5.5M3 9.5h18M10 20v-5h4v5" /></svg>
);
export const PurityIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M6 4h12l3 5-9 11L3 9Z" /><path d="M3 9h18M9 4l3 16 3-16" /></svg>
);
export const ScaleIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M12 4v16M6 20h12M5 7h14" /><path d="m5 7-2.5 6a2.5 2.5 0 0 0 5 0Zm14 0-2.5 6a2.5 2.5 0 0 0 5 0Z" /></svg>
);
export const HammerIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m13 7 4 4M4 20l9-9M11 5l3-2 7 7-2 3-3-1-4-4Z" /></svg>
);
export const ListIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><rect x="3" y="4" width="7" height="6" /><rect x="3" y="14" width="7" height="6" /><path d="M13 6h8M13 9h5M13 16h8M13 19h5" /></svg>
);
export const MapIcon = ({ className = "size-[18px]" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14" /></svg>
);
export const ChevronLeftIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m15 6-6 6 6 6" /></svg>
);
export const ChevronRightIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m9 6 6 6-6 6" /></svg>
);
export const MenuIcon = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const BookmarkIcon = ({ className = "size-[18px]", filled = false }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...base} fill={filled ? "currentColor" : "none"}><path d="M6 4h12v16l-6-4-6 4Z" /></svg>
);
export const CheckIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const CameraIcon = ({ className = "size-3.5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const ExpandIcon = ({ className = "size-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
);
