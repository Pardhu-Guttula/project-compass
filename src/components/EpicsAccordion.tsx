import { useState, useMemo, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { EpicsTable } from '@/components/EpicsTable';
import { Epic, EpicsWithStories, fetchEpicsWithStories } from '@/types/epics';
import { ExternalLink, Search, X, Loader2 } from 'lucide-react';
import { syncJiraTickets } from '../features/tools/toolsService';
import { useAppSelector } from '@/store/hooks';
// adjust path based on where your function is

interface EpicsAccordionProps {
  data?: any; // kept for backward compat, no longer used for fetching
}

export function EpicsAccordion({ data }: EpicsAccordionProps) {
  const jiraData = useAppSelector((state) => state.projects.jiraData); // ✅ TOP LEVEL

  console.log('Jira data from Redux:', jiraData); // Debug log to verify data structure
  const [epicsWithStories, setEpicsWithStories] =
    useState<EpicsWithStories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!jiraData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

    //const issues = jiraData?.data?.issues ?? [];
    const issues = Array.isArray(jiraData) ? jiraData : [];
    

      // ✅ 1. Separate Epics
    const epics = issues.filter(
      (issue: any) => issue.fields.issuetype.name === 'Epic'
    );

    // ✅ 2. Separate Stories
    const stories = issues.filter(
      (issue: any) => issue.fields.issuetype.name === 'Story'
    );

    // ✅ 3. Map Stories under their respective Epics
    const mappedEpics = epics.map((epic: any) => {
      const epicStories = stories.filter(
        (story: any) =>
          story.fields.parent?.key === epic.key
      );

      return {
        id: epic.key,
        title: epic.fields.summary,
        userStories: epicStories.map((story: any) => ({
          id: story.key,
          title: story.fields.summary,
          description: story.fields.description || '',
          priority: story.fields.priority?.name || 'Medium',
          status: story.fields.status?.name || 'To Do',
        })),
      };
    });

    setEpicsWithStories({
      jiraUrl: jiraData.jiraUrl,
      epics: mappedEpics,
    });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jiraData]); // ✅ dependency on redux state


  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !epicsWithStories) return null;

    const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return epicsWithStories.epics
      .map((epic) => ({
        epicId: epic.id,
        epicTitle: epic.title,
        matches: epic.userStories.filter((story) => {
           const haystack = [
    story.id ?? '',
    story.title ?? '',
    story.description ?? '',
    story.priority ?? '',
    story.status ?? '',
    epic.id ?? '',
    epic.title ?? '',
  ].join(' ').toLowerCase();
          return tokens.every((token) => haystack.includes(token));
        }),
      }))
      .filter((r) => r.matches.length > 0);
  }, [searchQuery, epicsWithStories]);

  const totalMatchCount = useMemo(
    () => searchResults?.reduce((acc, r) => acc + r.matches.length, 0) ?? 0,
    [searchResults]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Fetching epics from Jira...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 py-4">
        Failed to load Jira data: {error}
      </p>
    );
  }

  if (!epicsWithStories || epicsWithStories.epics.length === 0) {
    return <p className="text-sm text-muted-foreground">No epics found</p>;
  }

  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-800 border-red-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Low: 'bg-green-100 text-green-800 border-green-200',
  };

  const statusColors: Record<string, string> = {
    'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    Done: 'bg-green-100 text-green-800 border-green-200',
  };

  const jiraUrl = epicsWithStories.jiraUrl;

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        {jiraUrl && (
          <a
            href={jiraUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View in JIRA
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* ── Global Search Bar ── */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by word, letter, number, priority, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 bg-white"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Search Results View ── */}
      {searchQuery.trim() && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {totalMatchCount === 0
              ? `No results for "${searchQuery}"`
              : `${totalMatchCount} user stor${totalMatchCount === 1 ? 'y' : 'ies'} found across ${searchResults!.length} epic${searchResults!.length === 1 ? '' : 's'}`}
          </p>

          {totalMatchCount === 0 ? (
            <div className="text-center py-8 text-gray-400 border rounded-lg bg-gray-50">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No stories match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-blue-500 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            searchResults!.map((group) => (
              <div key={group.epicId} className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 flex items-center gap-2 border-b">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {group.epicId}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {group.epicTitle}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 shrink-0">
                    {group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="divide-y">
                  {group.matches.map((story) => (
                    <div
                      key={story.id}
                      className="px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-xs font-mono font-semibold text-gray-600 shrink-0 mt-0.5">
                            {story.id}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 leading-snug">
                              {story.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {story.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[story.priority]}`}>
                            {story.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[story.status]}`}>
                            {story.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Normal Accordion View ── */}
      {!searchQuery.trim() && (
        <Accordion type="multiple" className="w-full space-y-2">
          {epicsWithStories.epics.slice(0, 3).map((epic: Epic, index: number) => (
            <AccordionItem
              key={epic.id}
              value={`item-${index}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {epic.id}
                  </span>
                  <span className="font-medium">{epic.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({epic.userStories.length} user stories)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2">
                  <EpicsTable userStories={epic.userStories} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}