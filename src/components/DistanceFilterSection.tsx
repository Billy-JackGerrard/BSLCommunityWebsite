import { useState, useRef, useCallback } from "react";
import type { DistanceFilter } from "../hooks/useFilters";
import { useLocationSearch } from "../hooks/useLocationSearch";
import type { NominatimResult } from "../hooks/useLocationSearch";
import { useClickOutside } from "../hooks/useClickOutside";

type Props = {
  distanceFilter: DistanceFilter;
  onSetDistanceFilter: (f: NonNullable<DistanceFilter>) => void;
  onClearDistanceFilter: () => void;
};

const DEFAULT_RADIUS = 10;
const MIN_RADIUS = 1;
const MAX_RADIUS = 50;

export default function DistanceFilterSection({ distanceFilter, onSetDistanceFilter, onClearDistanceFilter }: Props) {
  const [sliderValue, setSliderValue] = useState<number>(
    distanceFilter ? distanceFilter.radiusMiles : DEFAULT_RADIUS
  );
  const [locationQuery, setLocationQuery] = useState("");
  const [confirmedLabel, setConfirmedLabel] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setDropdownOpen(false), []);
  useClickOutside(dropdownRef, closeDropdown, dropdownOpen);

  const { results, loading: searchLoading, clear: clearResults } = useLocationSearch(locationQuery);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const r = Number(e.target.value);
    setSliderValue(r);
    if (distanceFilter?.center) {
      onSetDistanceFilter({ center: distanceFilter.center, radiusMiles: r });
    }
  }

  function handleClear() {
    setSliderValue(DEFAULT_RADIUS);
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
    onSetDistanceFilter({ center, radiusMiles: sliderValue });
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
        onSetDistanceFilter({ center, radiusMiles: sliderValue });
      },
      () => setGeoStatus("error")
    );
  }

  return (
    <div className="filter-panel-distance">
      <div className="filter-panel-distance-header">
        <span className="filter-panel-distance-title">Nearby</span>
        {distanceFilter && (
          <button className="filter-panel-distance-clear" onClick={handleClear}>
            ✕ Any distance
          </button>
        )}
      </div>

      <div className="filter-panel-distance-slider-row">
        <input
          type="range"
          className="filter-panel-distance-slider"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step="1"
          value={sliderValue}
          onChange={handleSliderChange}
        />
        <span className="filter-panel-distance-slider-label">{sliderValue} mi</span>
      </div>

      <div className="filter-panel-distance-center" ref={dropdownRef}>
        {confirmedLabel ? (
          <div className="filter-panel-distance-confirmed">
            <span className="filter-panel-distance-confirmed-label">📍 {confirmedLabel}</span>
            <button
              className="filter-panel-distance-change-btn"
              onClick={() => { setConfirmedLabel(null); setLocationQuery(""); }}
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
    </div>
  );
}
