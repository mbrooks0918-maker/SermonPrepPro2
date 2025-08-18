export interface SermonIdea {
  id: string;
  title: string;
  description: string;
  scriptures: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sermon {
  id: string;
  title: string;
  theme: string;
  scripture: string;
  date: Date;
  notes: string;
  serviceAgenda: string;
  songs: string;
  creativeElements: string;
  announcements: string;
  socialMediaPlan: string;
  communicator: string;
  customFields: { [key: string]: string };
  status: 'draft' | 'in-progress' | 'complete';
}

export interface SermonSeries {
  id: string;
  title: string;
  description: string;
  summary: string;
  artwork?: File | string;
  bumperVideo?: File | string;
  color: string;
  startDate: Date;
  endDate: Date;
  sermons: Sermon[];
  collaborators: Collaborator[];
  status: 'planning' | 'active' | 'complete';
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'viewer';
  avatar?: string;
}

export interface CostEstimate {
  development: {
    frontend: number;
    backend: number;
    database: number;
    auth: number;
    fileStorage: number;
    aiIntegration: number;
    thirdPartyIntegrations: number;
  };
  hosting: {
    monthly: number;
    yearly: number;
  };
  maintenance: {
    monthly: number;
    yearly: number;
  };
  total: {
    initial: number;
    yearOne: number;
  };
}