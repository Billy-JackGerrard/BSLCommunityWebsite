

export type Event = {
    id: string;
    title: string;
    description?: string;
    location?: string;
    starts_at: string;
    finishes_at?: string;
    admin_id?: string;
    approved: boolean;
    created_at: string;
  };