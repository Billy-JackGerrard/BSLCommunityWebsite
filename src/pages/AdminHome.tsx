import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../supabaseClient";
import type { Section } from "../utils/types";
import "./AdminHome.css";

type HomeContent = {
  hero: {
    headline: string;
    subtitle: string;
  };
  sections: Section[];
};

type Props = {
  onSaved: () => void;
  onCancel: () => void;
};

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export default function AdminHome({ onSaved, onCancel }: Props) {
  const [headline, setHeadline] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const resizeAll = useCallback(() => {
    containerRef.current?.querySelectorAll<HTMLTextAreaElement>("textarea").forEach(autoResize);
  }, []);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "home")
      .single()
      .then(({ data, error }) => {
        if (error) setError("Failed to load content. Please try refreshing.");
        else if (data) {
          const c = data.content as HomeContent;
          setHeadline(c.hero?.headline ?? "");
          setSubtitle(c.hero?.subtitle ?? "");
          setSections(c.sections ?? []);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading) resizeAll();
  }, [loading, resizeAll]);

  useEffect(() => {
    resizeAll();
  }, [sections, resizeAll]);

  const updateTitle = (i: number, value: string) => {
    setSections(prev => prev.map((s, idx) => idx === i ? { ...s, title: value } : s));
  };

  const updateParagraph = (sIdx: number, pIdx: number, value: string) => {
    setSections(prev => prev.map((s, idx) =>
      idx === sIdx ? { ...s, paragraphs: s.paragraphs.map((p, j) => j === pIdx ? value : p) } : s
    ));
  };

  const addParagraph = (sIdx: number) => {
    setSections(prev => prev.map((s, idx) =>
      idx === sIdx ? { ...s, paragraphs: [...s.paragraphs, ""] } : s
    ));
  };

  const removeParagraph = (sIdx: number, pIdx: number) => {
    setSections(prev => prev.map((s, idx) =>
      idx === sIdx ? { ...s, paragraphs: s.paragraphs.filter((_, j) => j !== pIdx) } : s
    ));
  };

  const removeSection = (i: number) => {
    setSections(prev => prev.filter((_, idx) => idx !== i));
  };

  const addSection = () => {
    setSections(prev => [...prev, { title: "", paragraphs: [""] }]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const content: HomeContent = {
      hero: { headline, subtitle },
      sections,
    };
    const { error: dbError } = await supabase
      .from("site_content")
      .upsert({ key: "home", content, updated_at: new Date().toISOString() });
    setSaving(false);
    if (dbError) {
      setError("Failed to save. Please try again.");
      return;
    }
    onSaved();
  };

  return (
    <div className="admin-home-page">
      <div className="admin-home-container" ref={containerRef}>
        <h2 className="admin-home-title">Edit Home Page</h2>

        {error && <div className="form-error" role="alert">{error}</div>}

        {loading ? (
          <p className="admin-home-loading">Loading…</p>
        ) : (
          <>
            {/* Hero */}
            <div className="admin-home-section">
              <h3 className="admin-home-section-label">Hero</h3>
              <div className="admin-home-field">
                <label className="admin-home-label">Headline</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Main headline"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                />
              </div>
              <div className="admin-home-field">
                <label className="admin-home-label">Subtitle</label>
                <textarea
                  className="form-input admin-home-textarea"
                  placeholder="Subtitle text (use **bold** for bold)"
                  value={subtitle}
                  onChange={e => {
                    autoResize(e.target);
                    setSubtitle(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* Sections */}
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="admin-home-section">
                <div className="admin-home-section-header">
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Section title"
                    value={section.title}
                    onChange={e => updateTitle(sIdx, e.target.value)}
                  />
                  <button
                    className="admin-home-remove-section-btn"
                    onClick={() => removeSection(sIdx)}
                  >
                    Remove section
                  </button>
                </div>

                {section.paragraphs.map((para, pIdx) => (
                  <div key={pIdx} className="admin-home-para-row">
                    <textarea
                      className="form-input admin-home-textarea"
                      value={para}
                      placeholder="Paragraph text (use **bold** for bold)"
                      onChange={e => {
                        autoResize(e.target);
                        updateParagraph(sIdx, pIdx, e.target.value);
                      }}
                    />
                    <button
                      className="admin-home-remove-para-btn"
                      onClick={() => removeParagraph(sIdx, pIdx)}
                      title="Remove paragraph"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button className="admin-home-add-para-btn" onClick={() => addParagraph(sIdx)}>
                  + Add paragraph
                </button>
              </div>
            ))}

            <button className="admin-home-add-section-btn" onClick={addSection}>
              + Add section
            </button>

            <div className="admin-home-actions">
              <button className="admin-home-cancel-btn" onClick={onCancel} disabled={saving}>
                Cancel
              </button>
              <button className="admin-home-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="btn-loading">
                    <span className="btn-spinner" aria-hidden="true" />
                    Saving…
                  </span>
                ) : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
