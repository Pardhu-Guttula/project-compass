export interface UserStory {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'Done';
}

export interface Epic {
  id: string;
  title: string;
  userStories: UserStory[];
}

export interface EpicsWithStories {
  epics: Epic[];
  jiraUrl: string;
}

// Mock data generator for demonstration purposes
// In production, this data would come from the API
export const generateMockUserStories = (epicId: string, epicTitle: string): UserStory[] => {
  const storyTemplates = [
    // Page 1 (1–5)
    { title: 'As a user, I can login to the system', description: 'Implement secure authentication with email/password', priority: 'High' as const, status: 'Done' as const },
    { title: 'As a user, I can view my dashboard', description: 'Display personalized dashboard with relevant information', priority: 'High' as const, status: 'Done' as const },
    { title: 'As a user, I can create new items', description: 'Add functionality to create new items in the system', priority: 'Medium' as const, status: 'In Progress' as const },
    { title: 'As a user, I can edit existing items', description: 'Allow editing of items with proper validation', priority: 'Medium' as const, status: 'In Progress' as const },
    { title: 'As a user, I can delete items', description: 'Implement soft delete with confirmation dialog', priority: 'Low' as const, status: 'To Do' as const },
    // Page 2 (6–10)
    { title: 'As a user, I can search for items', description: 'Full-text search with filters', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As a user, I can export data', description: 'Export data to CSV/Excel format', priority: 'Low' as const, status: 'To Do' as const },
    { title: 'As a user, I can import data', description: 'Import data from CSV files', priority: 'Low' as const, status: 'To Do' as const },
    { title: 'As a user, I can manage settings', description: 'User preferences and account settings', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As an admin, I can manage users', description: 'CRUD operations for user management', priority: 'High' as const, status: 'In Progress' as const },
    // Page 3 (11–15)
    { title: 'As an admin, I can view reports', description: 'Generate and view system reports', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As an admin, I can configure system', description: 'System configuration and settings', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As a user, I can reset my password', description: 'Send reset link via email with expiry token', priority: 'High' as const, status: 'Done' as const },
    { title: 'As a user, I can update my profile', description: 'Edit name, avatar, and contact details', priority: 'Low' as const, status: 'In Progress' as const },
    { title: 'As a user, I can view notifications', description: 'Real-time in-app notification center', priority: 'Medium' as const, status: 'To Do' as const },
    // Page 4 (16–20)
    { title: 'As a user, I can filter results', description: 'Apply multiple filters simultaneously on list views', priority: 'Medium' as const, status: 'In Progress' as const },
    { title: 'As a user, I can sort table columns', description: 'Click column headers to sort ascending or descending', priority: 'Low' as const, status: 'Done' as const },
    { title: 'As a user, I can pin favourite items', description: 'Star items to pin them to the top of lists', priority: 'Low' as const, status: 'To Do' as const },
    { title: 'As an admin, I can audit user activity', description: 'View logs of all user actions with timestamps', priority: 'High' as const, status: 'To Do' as const },
    { title: 'As an admin, I can assign roles', description: 'Grant or revoke permissions per user role', priority: 'High' as const, status: 'In Progress' as const },
    // Page 5 (21–25)
    { title: 'As a user, I can comment on items', description: 'Add threaded comments to any item', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As a user, I can attach files', description: 'Upload documents and images to items', priority: 'Medium' as const, status: 'To Do' as const },
    { title: 'As a user, I can share items', description: 'Generate a shareable link with access control', priority: 'Low' as const, status: 'To Do' as const },
    { title: 'As a user, I can view item history', description: 'See a changelog of all edits made to an item', priority: 'Low' as const, status: 'To Do' as const },
    { title: 'As an admin, I can bulk delete', description: 'Select multiple records and delete in one action', priority: 'High' as const, status: 'To Do' as const },
  ];

  return storyTemplates.map((story, index) => ({
    id: `${epicId}-US-${index + 1}`,
    title: story.title,
    description: story.description,
    priority: story.priority,
    status: story.status,
  }));
};

export const generateEpicsWithStories = (titles: string[], ids?: string[], jiraUrl?: string): EpicsWithStories => {
  const epics: Epic[] = titles.map((title, index) => ({
    id: ids?.[index] || `EPIC-${index + 1}`,
    title,
    userStories: generateMockUserStories(ids?.[index] || `EPIC-${index + 1}`, title),
  }));

  return {
    epics,
    jiraUrl: jiraUrl || '',
  };
};