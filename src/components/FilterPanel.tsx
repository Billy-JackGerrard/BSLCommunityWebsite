import { CATEGORIES, CATEGORY_COLOURS } from "../utils/types";
import { DATE_FILTER_LABELS } from "../utils/eventFilters";
import type { DateFilter } from "../utils/eventFilters";
import type { DistanceFilter, Granularity } from "../hooks/useFilters";
import DistanceFilterSection from "./DistanceFilterSection";
import "./FilterPanel.css";

// Re-export so callers can import type + labels from one place
export type { DateFilter };
export { DATE_FILTER_LABELS };

type Props = {
  selectedCategories: Set<string>;
  onToggleCategory: (cat: string) => void;
  onClearCategories: () => void;
  dateFilter: DateFilter;
  onSetDateFilter: (f: DateFilter) => void;
  distanceFilter: DistanceFilter;
  onSetDistanceFilter: (f: NonNullable<DistanceFilter>) => void;
  onClearDistanceFilter: () => void;
  /** Show only category dots — hides date filters and clear button */
  compact?: boolean;
  /** "map" renders granularity segmented control; "default" renders date pills */
  mode?: "map" | "default";
  granularity?: Granularity;
  onSetGranularity?: (g: Granularity) => void;
};

export default function FilterPanel({
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  dateFilter,
  onSetDateFilter,
  distanceFilter,
  onSetDistanceFilter,
  onClearDistanceFilter,
  compact,
  mode,
  granularity,
  onSetGranularity,
}: Props) {
  return (
    <div className="filter-panel">
      {!compact && mode === "map" && (
        <div className="filter-panel-granularity" role="radiogroup" aria-label="Date range">
          {(["day", "week", "month"] as const).map(g => (
            <button
              key={g}
              role="radio"
              aria-checked={granularity === g}
              className={`filter-panel-gran-btn${granularity === g ? " filter-panel-gran-btn--active" : ""}`}
              onClick={() => onSetGranularity?.(g)}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      )}
      {!compact && mode !== "map" && (
        <div className="filter-panel-dates">
          {(["all", "week", "weekend", "month"] as const).map(f => (
            <button
              key={f}
              className={`filter-panel-date-btn${dateFilter === f ? " filter-panel-date-btn--active" : ""}`}
              onClick={() => onSetDateFilter(f)}
            >
              {DATE_FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      )}
      {!compact && (
        <DistanceFilterSection
          distanceFilter={distanceFilter}
          onSetDistanceFilter={onSetDistanceFilter}
          onClearDistanceFilter={onClearDistanceFilter}
        />
      )}
      <div className="filter-panel-cats">
        <button
          className={`filter-panel-cat${selectedCategories.size === 0 ? " filter-panel-cat--active" : ""}`}
          onClick={onClearCategories}
        >
          <span className="filter-panel-cat-dot" style={{ background: "var(--color-text-muted)" }} />
          <span className="filter-panel-cat-label">All</span>
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-panel-cat${
              selectedCategories.has(cat)
                ? " filter-panel-cat--active"
                : selectedCategories.size > 0
                ? " filter-panel-cat--dimmed"
                : ""
            }`}
            onClick={() => onToggleCategory(cat)}
          >
            <span className="filter-panel-cat-dot" style={{ background: CATEGORY_COLOURS[cat] }} />
            <span className="filter-panel-cat-label">{cat}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
