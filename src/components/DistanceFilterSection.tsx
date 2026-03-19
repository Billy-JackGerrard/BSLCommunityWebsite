import { useState, useRef, useCallback } from "react";
import type { DistanceFilter, RadiusMiles } from "../hooks/useFilters";
import { RADIUS_OPTIONS } from "../hooks/useFilters";
import { useLocationSearch } from "../hooks/useLocationSearch";
import type { NominatimResult } from "../hooks/useLocationSearch";
import { useClickOutside } from "../hooks/useClickOutside";

type Props = {
  distanceFilter: DistanceFilter;
  onSetDistanceFilter: (f: NonNullable<DistanceFilter>) => void;
  onClearDistanceFilter: () => void;
};

export default function DistanceFilterSection({ distanceFilter, onSetDistanceFilter, onClearDistanceFilter }: Props) {
  const [pendingRadius, setPendingRadius] = useState<RadiusMiles | null>(
    distanceFilter ? (distanceFilter.radiusMiles as RadiusMiles) : null
  );
  const [locationQuery, setLocationQuery] = useState("");
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(
    distanceFilter ? null : null
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown, dropdownOpen);

  const { results, loading: searchLoading, clear: clearResults } = useLocationSearch(locationQuery);

  const activeRadius = distanceFilter?.radiusMiles ?? pendingRadius;

  function handleRadiusClick(r: RadiusMiles) {
    setPendingRadius(r);
    if (distanceFilter?.center) {
      onSetDistanceFilter({ center: distanceFilter.center, radiusMiles: r });
    }
  }

  function handleClear() {
    setPendingRadius(null);
    setConfirmedLabel(null);
    setLocationQuery("");
    setGeoStatus("idle");
    clearResults();
    onClearDistanceFilter();
  }

  function handleLocationSelect(result: NominatimResult) {
    const label = result.address?.amenity || result.name || result.display_name.split(",")[0];
    const center = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setConfirmedLabel(label);
    setLocationQuery("");
    setDropdownOpen(false);
    clearResults();
    setGeoStatus("idle");
    const radius = pendingRadius ?? 10;
    if (!pendingRadius) setPendingRadius(10 as RadiusMiles);
    onSetDistanceFilter({ center, radiusMiles: radius });
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    setConfirmedLabel(null);
    setLocationQuery("");
    clearResults();
    navigator.geolocation.getCurrentPosition(
      pos => {
        const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setConfirmedLabel("Your location");
        setGeoStatus("idle");
        const radius = pendingRadius ?? 10;
        if (!pendingRadius) setPendingRadius(10 as RadiusMiles);
        onSetDistanceFilter({ center, radiusMiles: radius });
      },
      () => setGeoStatus("error")
    );
  }

  const showCenterRow = pendingRadius !== null || distanceFilter !== null;

  return (
    <div className="filter-panel-distance">
      <div className="filter-panel-distance-radii">
        <button
          className={`filter-panel-date-btn${!activeRadius ? " filter-panel-date-btn--active" : ""}`}
          onClick={handleClear}
        >
          Any distance
        </button>
        {RADIUS_OPTIONS.map(r => (
          <button
            key={r}
            className={`filter-panel-date-btn${activeRadius === r ? " filter-panel-date-btn--active" : ""}`}
            onClick={() => handleRadiusClick(r)}
          >
            {r} mi
          </button>
        ))}
      </div>

      {showCenterRow && (
        <div className="filter-panel-distance-center" ref={dropdownRef}>
          {confirmedLabel ? (
            <div className="filter-panel-distance-confirmed">
              <span className="filter-panel-distance-confirmed-label">
                📍 {confirmedLabel}
              </span>
              <button
                className="filter-panel-distance-change-btn"
                onClick={() => {
                  setConfirmedLabel(null);
                  setLocationQuery("");
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <button
                className="filter-panel-distance-geo-btn"
                onClick={handleUseMyLocation}
                disabled={geoStatus === "loading"}
              >
                {geoStatus === "loading" ? "Locating…" : "📍 Use my location"}
              </button>
              <span className="filter-panel-distance-or">or</span>
              <div className="filter-panel-distance-search">
                <input
                  className="filter-panel-distance-input"
                  type="text"
                  placeholder="Type a place…"
                  value={locationQuery}
                  onChange={e => { setLocationQuery(e.target.value); setDropdownOpen(true); }}
                  onFocus={() => { if (results.length > 0) setDropdownOpen(true); }}
                />
                {dropdownOpen && (results.length > 0 || (searchLoading && locationQuery.length >= 3)) && (
                  <div className="filter-panel-distance-dropdown">
                    {results.map(r => (
                      <button
                        key={r.place_id}
                        type="button"
                        className="filter-panel-distance-dropdown-option"
                        onMouseDown={e => { e.preventDefault(); handleLocationSelect(r); }}
                      >
                        <span className="filter-panel-distance-dropdown-name">
                          {r.address?.amenity || r.name || r.display_name.split(",")[0]}
                        </span>
                        <span className="filter-panel-distance-dropdown-detail">
                          {r.display_name.split(",").slice(1, 3).join(",").trim()}
                        </span>
                      </button>
                    ))}
                    {searchLoading && results.length === 0 && (
                      <div className="filter-panel-distance-dropdown-loading">Searching…</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
          {geoStatus === "error" && (
            <span className="filter-panel-distance-error">Location access denied.</span>
          )}
        </div>
      )}
    </div>
  );
}
