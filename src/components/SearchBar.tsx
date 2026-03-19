import type { RefObject, ReactNode } from "react";

type Props = {
  value: string;
  onChange: (query: string) => void;
  onClose: () => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  wrapRef?: RefObject<HTMLDivElement | null>;
  /** Extra class(es) applied to the outer wrapper div for layout/positioning. */
  wrapperClassName?: string;
  /** Optional content rendered below the bar (e.g. a search-results dropdown). */
  children?: ReactNode;
};

export default function SearchBar({ value, onChange, onClose, inputRef, wrapRef, wrapperClassName, children }: Props) {
  return (
    <div className={wrapperClassName} ref={wrapRef}>
      <div className="search-bar">
        <span className="search-bar-icon">⌕</span>
        <input
          ref={inputRef}
          className="search-bar-input"
          type="text"
          placeholder="Search events…"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === "Escape" && onClose()}
        />
        <button className="search-bar-close" onClick={onClose} title="Close search">✕</button>
      </div>
      {children}
    </div>
  );
}
