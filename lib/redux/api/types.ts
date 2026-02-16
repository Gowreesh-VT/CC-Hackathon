export type Team = {
  id: string;
  name: string;
  track?: string | null;
  currentRoundId?: string | null;
  score?: number | null;
};

export type Round = {
  id: string;
  round_number?: number;
  name?: string;
  status?: "draft" | "active" | "paused" | "closed";
  is_active?: boolean;
  submission_enabled?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  start_time?: string | null;
  end_time?: string | null;
};

export type Judge = {
  id: string;
  name: string;
  email: string;
  assignedTeams?: string[];
  assignedTeamsCount?: number;
};

export type Submission = {
  id: string;
  teamId: string;
  roundId: string;
  status?: "pending" | "scored" | "rejected";
  score?: number | null;
};

// Admin-specific types
export type AdminDashboard = {
  totalTeams: number;
  currentRound: Round | null;
  currentRoundId: string | null;
  submissionsCount: number;
  pendingEvaluationCount: number;
  roundStatus: "idle" | "active" | "paused" | "closed";
  submissionEnabled: boolean;
};

export type Subtask = {
  id: string;
  title: string;
  description: string;
  round_id: string;
  is_active?: boolean;
};

export type TeamDetail = {
  id: string;
  name: string;
  track: string | null;
  currentRoundId: string | null;
  currentRoundName: string | null;
  score: number | null;
  submissionStatus: "pending" | "submitted" | "locked" | "not_required";
  isShortlisted?: boolean;
  isLocked?: boolean;
};

export type RoundTeamSelection = {
  teamId: string;
  teamName: string;
  shownOptions: { id: string; title: string }[];
  chosenOption: { id: string; title: string } | null;
  nextRoundTaskA?: string;
  nextRoundTaskB?: string;
};

export type JudgeAssignment = {
  judgeId: string;
  teamIds: string[];
  roundId: string;
};
