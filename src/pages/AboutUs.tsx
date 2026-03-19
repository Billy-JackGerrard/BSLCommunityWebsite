import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Section } from "../utils/types";
import { useInView } from "../hooks/useInView";
import "./AboutUs.css";

type AboutContent = {
  sections: Section[];
};

function renderParagraph(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

type Props = {
  isLoggedIn: boolean;
  onEdit: () => void;
};

function AboutSection({ section }: { section: Section }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <section ref={ref as React.Ref<HTMLElement>} className={`about-section scroll-reveal${isInView ? " in-view" : ""}`}>
      <h3 className="section-label">{section.title}</h3>
      {section.paragraphs.map((para, j) => (
        <p key={j} className="about-body">
          {renderParagraph(para)}
        </p>
      ))}
    </section>
  );
}

export default function AboutUs({ isLoggedIn, onEdit }: Props) {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "about_us")
      .single()
      .then(({ data, error }) => {
        if (error) setFetchError(true);
        else setContent(data ? (data.content as AboutContent) : null);
        setLoading(false);
      });
  }, []);

  return (
    <div className="about-page">
      <div className="page-card about-card">

        <div className="about-header">
          <h2 className="about-title">About Us</h2>
          {isLoggedIn && (
            <button className="about-edit-btn" onClick={onEdit}>Edit</button>
          )}
        </div>

        {loading ? (
          <p className="about-body">Loading…</p>
        ) : fetchError ? (
          <p className="about-body about-empty">Failed to load content. Please try refreshing the page.</p>
        ) : !content || content.sections.length === 0 ? (
          <p className="about-body about-empty">No content yet.</p>
        ) : (
          content.sections.map((section, i) => (
            <AboutSection key={i} section={section} />
          ))
        )}

      </div>
    </div>
  );
}
