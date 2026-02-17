import { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { EpicsTable } from '@/components/EpicsTable';
import { Epic, generateEpicsWithStories } from '@/types/epics';
import { ExternalLink, Search, X } from 'lucide-react';

interface EpicsAccordionProps {
  data: {
    titles: string[];
    ids?: string[];
    jiraUrl: string;
  };
}

export function EpicsAccordion({ data }: EpicsAccordionProps) {
  if (!data || !data.titles || data.titles.length === 0) {
    return <p className="text-sm text-muted-foreground">No epics found</p>;
  }

  const epicsWithStories = generateEpicsWithStories(data.titles, data.ids, data.jiraUrl);

  const [searchQuery, setSearchQuery] = useState('');

  // ── Search across ALL epics and their user stories ──
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    // Split query into individual tokens — "login high" matches stories
    // that contain BOTH "login" AND "high" anywhere across all fields
    const tokens = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const results: {
      epicId: string;
      epicTitle: string;
      matches: typeof epicsWithStories.epics[0]['userStories'];
    }[] = [];

    epicsWithStories.epics.forEach((epic) => {
      const matchingStories = epic.userStories.filter((story) => {
        // Combine every field into one searchable string
        const haystack = [
          story.id,
          story.title,
          story.description,
          story.priority,
          story.status,
          epic.id,       // also match by epic ID
          epic.title,    // also match by epic title
        ]
          .join(' ')
          .toLowerCase();

        // Every token must appear somewhere — partial matches work too
        // e.g. "log" matches "login", "us" matches "user"
        return tokens.every((token) => haystack.includes(token));
      });

      if (matchingStories.length > 0) {
        results.push({
          epicId: epic.id,
          epicTitle: epic.title,
          matches: matchingStories,
        });
      }
    });

    return results;
  }, [searchQuery, epicsWithStories]);

  const totalMatchCount =
    searchResults?.reduce((acc, r) => acc + r.matches.length, 0) ?? 0;

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

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        {data.jiraUrl && (
          <a
            href={data.jiraUrl}
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
          {/* Result count */}
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

                {/* Epic header */}
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

                {/* Matching stories */}
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

      {/* ── Normal Accordion View (hidden while searching) ── */}
      {!searchQuery.trim() && (
        <Accordion type="multiple" className="w-full space-y-2">
          {epicsWithStories.epics.slice(0, 2).map((epic: Epic, index: number) => (
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