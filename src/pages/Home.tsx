import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import type { Section } from "../utils/types";
import { useInView } from "../hooks/useInView";
import "./Home.css";

type HomeContent = {
  hero: {
    headline: string;
    subtitle: string;
  };
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
  onNavigate: (view: "calendar") => void;
};

function HomeSection({ section }: { section: Section }) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <section ref={ref as React.Ref<HTMLElement>} className={`home-section scroll-reveal${isInView ? " in-view" : ""}`}>
      <h3 className="section-label">{section.title}</h3>
      {section.paragraphs.map((para, j) => (
        <p key={j} className="home-body">
          {renderParagraph(para)}
        </p>
      ))}
    </section>
  );
}

export default function Home({ isLoggedIn, onEdit, onNavigate }: Props) {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "home")
      .single()
      .then(({ data, error }) => {
        if (error) setFetchError(true);
        else setContent(data ? (data.content as HomeContent) : null);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home-page">
      <div className="home-hero">
        {isLoggedIn && (
          <button className="home-edit-btn" onClick={onEdit}>Edit</button>
        )}
        {loading ? (
          <div className="home-hero-text">
            <p className="home-body">Loading…</p>
          </div>
        ) : fetchError ? (
          <div className="home-hero-text">
            <p className="home-body home-empty">Failed to load content. Please try refreshing.</p>
          </div>
        ) : (
          <div className="home-hero-text">
            <h1 className="home-headline">
              {content?.hero.headline || "Welcome"}
            </h1>
            {content?.hero.subtitle && (
              <p className="home-subtitle">{renderParagraph(content.hero.subtitle)}</p>
            )}
            <button
              className="home-cta-btn"
              onClick={() => onNavigate("calendar")}
            >
              View Events
            </button>
          </div>
        )}
      </div>

      {!loading && !fetchError && content?.sections && content.sections.length > 0 && (
        <div className="home-sections-area">
          <div className="page-card home-card">
            {content.sections.map((section, i) => (
              <HomeSection key={i} section={section} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
