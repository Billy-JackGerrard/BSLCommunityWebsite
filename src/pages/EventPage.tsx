import type { Event } from "../utils/types";
import EventDetailCard from "../components/events/EventDetails";
import "./EventPage.css";

type Props = {
  event: Event;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  userId?: string | null;
  onBack: () => void;
  onEdit: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  onReport?: (event: Event) => void;
};

export default function EventPage({ event, isLoggedIn, isAdmin, userId, onBack, onEdit, onDelete, onDuplicate, onReport }: Props) {
  return (
    <div className="eventpage-page">
      <div className="eventpage-card">
        <EventDetailCard
          event={event}
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          userId={userId}
          onClose={onBack}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onReport={onReport}
        />
      </div>
    </div>
  );
}
