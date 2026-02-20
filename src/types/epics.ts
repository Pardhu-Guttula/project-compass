import axiosInstance from "@/api/axiosInstance";

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

// ─── Priority Mapper ────────────────────────────────────────────────────────
const mapPriority = (priority: string): UserStory['priority'] => {
  const map: Record<string, UserStory['priority']> = {
    Highest: 'High',
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
    Lowest: 'Low',
  };
  return map[priority] ?? 'Medium';
};

// ─── Status Mapper ──────────────────────────────────────────────────────────
const mapStatus = (status: string): UserStory['status'] => {
  const map: Record<string, UserStory['status']> = {
    'To Do': 'To Do',
    'In Progress': 'In Progress',
    Done: 'Done',
    Closed: 'Done',
    Resolved: 'Done',
  };
  return map[status] ?? 'To Do';
};


// ─── Map a Jira Story → UserStory ───────────────────────────────────────────
const mapJiraStory = (issue: any): UserStory => ({
  id: issue.key,
  title: issue.fields.summary,
  description: issue.fields.description ?? '',
  priority: mapPriority(issue.fields.priority?.name ?? 'Medium'),
  status: mapStatus(issue.fields.status?.name ?? 'To Do'),
});

// ─── Main Fetch Function ─────────────────────────────────────────────────────
// Single API call with issuetype "Both", split client-side, group by parent.key

export const fetchEpicsWithStories = (
  jiraData: any
): EpicsWithStories => {

  const epicIssues = jiraData?.epics ?? [];
  const storyIssues = jiraData?.stories ?? [];

  if (epicIssues.length === 0) {
    return { epics: [], jiraUrl: 'https://brillio.atlassian.net' };
  }

  const storyMap = new Map<string, UserStory[]>();

  for (const story of storyIssues) {
    const epicKey =
      story.fields?.parent?.key ??
      story.fields?.customfield_10002 ??
      null;

    if (!epicKey) continue;

    if (!storyMap.has(epicKey)) storyMap.set(epicKey, []);
    storyMap.get(epicKey)!.push(mapJiraStory(story));
  }

  const epics: Epic[] = epicIssues.map((epicIssue: any) => ({
    id: epicIssue.key,
    title: epicIssue.fields.summary,
    userStories: storyMap.get(epicIssue.key) ?? [],
  }));

  return {
    epics,
    jiraUrl: 'https://brillio.atlassian.net',
  };
};