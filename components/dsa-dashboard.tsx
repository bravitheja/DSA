import Link from "next/link";
import { ExternalLink, Lightbulb, NotebookPen, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type DsaProblem = {
  problem: string;
  link: string;
  pattern: string;
  subPattern: string;
  difficulty: "Easy" | "Medium" | "Hard";
  coreIdea: string;
  complexity: string;
  status: string;
  notes: string;
};

type DashboardProps = {
  problems: DsaProblem[];
  query: string;
  selectedPattern: string;
  selectedDifficulty: string;
  onQueryChange: (value: string) => void;
  onPatternChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
  onNotesSave: (problemName: string, notes: string) => void;
};

const difficultyClasses: Record<DsaProblem["difficulty"], string> = {
  Easy: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  Medium: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  Hard: "bg-rose-500/15 text-rose-300 border-rose-400/30",
};

const patternClasses: Record<string, string> = {
  "Sliding Window": "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
  DP: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  Graph: "bg-indigo-500/10 text-indigo-300 border-indigo-400/20",
  Tree: "bg-lime-500/10 text-lime-300 border-lime-400/20",
  default: "bg-zinc-700/60 text-zinc-200 border-zinc-600",
};

export function DsaDashboardLayout({
  problems,
  query,
  selectedPattern,
  selectedDifficulty,
  onQueryChange,
  onPatternChange,
  onDifficultyChange,
  onNotesSave,
}: DashboardProps) {
  const solvedCount = problems.filter((problem) => problem.status === "Solved").length;
  const totalCount = problems.length;

  const easyCount = problems.filter((problem) => problem.difficulty === "Easy").length;
  const mediumCount = problems.filter((problem) => problem.difficulty === "Medium").length;
  const hardCount = problems.filter((problem) => problem.difficulty === "Hard").length;

  return (
    <div className="grid min-h-screen grid-cols-[280px_1fr] bg-zinc-950 text-zinc-100">
      <aside className="border-r border-zinc-800 bg-zinc-900/70 p-4">
        <div className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-300">Stats & Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-semibold tracking-tight">{solvedCount}/{totalCount}</p>
                <p className="text-xs text-zinc-400">Total solved</p>
                <Progress value={totalCount === 0 ? 0 : (solvedCount / totalCount) * 100} className="mt-3 h-2" />
              </div>

              <div className="space-y-2 text-xs text-zinc-300">
                <DifficultyRing label="Easy" value={easyCount} total={totalCount} tone="text-emerald-300" />
                <DifficultyRing label="Medium" value={mediumCount} total={totalCount} tone="text-amber-300" />
                <DifficultyRing label="Hard" value={hardCount} total={totalCount} tone="text-rose-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
          <GlobalFilterBar
            query={query}
            selectedPattern={selectedPattern}
            selectedDifficulty={selectedDifficulty}
            onQueryChange={onQueryChange}
            onPatternChange={onPatternChange}
            onDifficultyChange={onDifficultyChange}
            patterns={[...new Set(problems.map((item) => item.pattern))]}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-88px)] px-6 py-4">
          <Card className="border-zinc-800 bg-zinc-900/60">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-[34%] text-zinc-400">Problem</TableHead>
                  <TableHead className="text-zinc-400">Pattern</TableHead>
                  <TableHead className="text-zinc-400">Complexity</TableHead>
                  <TableHead className="text-zinc-400">Difficulty</TableHead>
                  <TableHead className="text-right text-zinc-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.map((problem) => (
                  <ProblemTableRow key={problem.problem} problem={problem} onNotesSave={onNotesSave} />
                ))}
              </TableBody>
            </Table>
          </Card>
        </ScrollArea>
      </main>
    </div>
  );
}

type FilterBarProps = {
  query: string;
  selectedPattern: string;
  selectedDifficulty: string;
  patterns: string[];
  onQueryChange: (value: string) => void;
  onPatternChange: (value: string) => void;
  onDifficultyChange: (value: string) => void;
};

function GlobalFilterBar({
  query,
  selectedPattern,
  selectedDifficulty,
  patterns,
  onQueryChange,
  onPatternChange,
  onDifficultyChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
      <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg bg-zinc-800/60 px-3 py-2">
        <Search className="h-4 w-4 text-zinc-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
          placeholder="Search by problem name..."
        />
      </div>

      <FilterPopover
        label={`Pattern: ${selectedPattern}`}
        options={["All", ...patterns]}
        onSelect={onPatternChange}
      />

      <FilterPopover
        label={`Difficulty: ${selectedDifficulty}`}
        options={["All", "Easy", "Medium", "Hard"]}
        onSelect={onDifficultyChange}
      />
    </div>
  );
}

function FilterPopover({
  label,
  options,
  onSelect,
}: {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800">
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 border-zinc-800 bg-zinc-900 p-0">
        <Command className="bg-zinc-900">
          <CommandInput placeholder="Filter..." className="text-zinc-200" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option} value={option} onSelect={() => onSelect(option)}>
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DifficultyRing({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="flex items-center justify-between rounded-md border border-zinc-800 px-2 py-1.5">
      <span className="text-zinc-400">{label}</span>
      <span className={tone}>{value} ({percentage}%)</span>
    </div>
  );
}

type RowProps = {
  problem: DsaProblem;
  onNotesSave: (problemName: string, notes: string) => void;
};

export function ProblemTableRow({ problem, onNotesSave }: RowProps) {
  const patternTone = patternClasses[problem.pattern] ?? patternClasses.default;

  return (
    <TableRow className="border-zinc-800">
      <TableCell className="py-4 align-middle">
        <div className="flex items-center gap-2">
          <Link href={problem.link} target="_blank" className="font-semibold text-zinc-100 hover:text-white">
            {problem.problem}
          </Link>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />

          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button aria-label={`View core idea for ${problem.problem}`} className="rounded p-1 hover:bg-zinc-800">
                  <Lightbulb className="h-4 w-4 text-zinc-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs border-zinc-800 bg-zinc-900 text-zinc-100">
                <p className="text-xs leading-relaxed text-zinc-200">{problem.coreIdea}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>

      <TableCell className="py-4">
        <Badge variant="outline" className={patternTone}>
          {problem.pattern}
        </Badge>
      </TableCell>

      <TableCell className="py-4 font-mono text-sm text-zinc-300">{problem.complexity}</TableCell>

      <TableCell className="py-4">
        <Badge variant="outline" className={difficultyClasses[problem.difficulty]}>
          {problem.difficulty}
        </Badge>
      </TableCell>

      <TableCell className="py-4 text-right">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50">
              <NotebookPen className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="text-zinc-100">{problem.problem} Notes</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-zinc-400">Capture pitfalls, observations, and follow-ups.</p>
              <Textarea
                defaultValue={problem.notes}
                className="min-h-[240px] border-zinc-800 bg-zinc-900 text-zinc-100"
                onBlur={(event) => onNotesSave(problem.problem, event.target.value)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </TableCell>
    </TableRow>
  );
}
