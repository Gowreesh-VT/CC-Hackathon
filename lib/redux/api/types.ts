export type Track = {
  id: string;
  name: string;
  description?: string;
  is_active?: boolean;
};

export type Team = {
  id: string;
  team_name: string;
  email?: string;
  mobile_number?: string;
  team_size?: number;
  track?: string | null;
  track_id?: string | null;
  cumulative_score?: number | null;
  round_scores?: Array<{
    round_id: string;
    round_number: number;
    score: number | null;
    sec_score?: number | null;
    faculty_score?: number | null;
    num_judges?: number;
  }>;
};

export type Round = {
  _id: string;
  id: string;
  round_number?: number;
  is_active?: boolean;
  start_time?: string | null;
  end_time?: string | null;
  instructions?: string;
};

export type Judge = {
  id: string;
  judge_name: string;
  email: string;
  track?: string;
  track_id?: string | null;
  teams_assigned?: string[];
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
  currentRound: { id: string; name: string; round_number: number } | null;
  roundStatus: "idle" | "active" | "inactive" | "upcoming" | "completed";
  submissionsCount: number;
  pendingEvaluationCount: number;
  topTeams?: Array<{
    id: string;
    name: string;
    cumulativeScore: number;
    track: string;
  }>;
};

export type Subtask = {
  id: string;
  title: string;
  description: string;
  track?: string;
  track_id?: string | null;
  is_active?: boolean;
};

export type TeamDetail = {
  id: string;
  team_name: string;
  email?: string;
  mobile_number?: string;
  team_size?: number;
  track: string | null;
  track_id?: string | null;
  cumulative_score: number;
  rounds_accessible?: Array<{ id: string; round_number: number }>;
  history?: Array<{
    round_id: string;
    round_name: string;
    status: string;
    selection?: string;
    github_link?: string;
    submission_file?: string;
    score: number | null;
    remarks?: string;
  }>;
};

export type RoundTeam = {
  id: string;
  team_name: string;
  team_size?: number | null;
  track: string;
  track_id: string | null;
  score: number | null;
  sec_score?: number | null;
  faculty_score?: number | null;
  previous_round_score?: number | null;
  previous_round_number?: number | null;
  allowed: boolean;
  pair?: {
    pair_id: string;
    teammate_id: string;
    teammate_name: string;
  } | null;
  priority_meta?: {
    assignment_mode: "team" | "pair";
    priority_team_id: string | null;
    paired_team_id: string | null;
    auto_assigned: boolean;
  } | null;
  submission: {
    id: string;
    github_link?: string;
    file_url?: string;
    submitted_at?: string;
  } | null;
  subtask_history: {
    options: { id: string; title: string }[];
    selected: { id: string; title: string } | null;
    selected_at?: string;
    assignment_mode?: "team" | "pair";
    priority_team_id?: string | null;
    paired_team_id?: string | null;
    auto_assigned?: boolean;
  } | null;
};

export type Pair = {
  id: string;
  track: string;
  track_id: string | null;
  team_a: { id: string; team_name: string };
  team_b: { id: string; team_name: string };
  created_at?: string;
};

export type PairingInfo = {
  pair_id: string;
  partner_team_id: string | null;
  partner_team_name: string | null;
};

export type PriorityMeta = {
  is_priority_team: boolean;
  priority_selected: boolean;
  waiting_for_priority: boolean;
  auto_assigned: boolean;
};

export type TeamRoundSelection = {
  _id: string;
  selected: {
    _id: string;
    title: string;
    description: string;
    statement?: string | null;
    track_id?: { _id: string; name: string; description?: string | null } | null;
  } | null;
  team_id: string;
  round_id: string;
  selected_at?: string | null;
  assignment_mode: "team" | "pair";
  pair_id: string | null;
  priority_team_id: string | null;
  paired_team_id: string | null;
  published_at: string | null;
  auto_assigned: boolean;
};

export type TeamRoundDetails = {
  round: {
    _id: string;
    round_number: number;
    is_active: boolean;
    instructions?: string;
    start_time?: string | null;
    end_time?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  team: {
    _id: string;
    team_name: string;
    track: string;
    track_id: string | null;
    track_description?: string | null;
  };
  selection: TeamRoundSelection | null;
  subtask: {
    _id: string;
    title: string;
    description: string;
    track: string | null;
    statement: string | null;
  } | null;
  initialSubtasks: Array<{
    _id: string;
    title: string;
    description: string;
  }>;
  pair_info: PairingInfo | null;
  priority_state: PriorityMeta | null;
  all_track_subtasks: Array<{
    _id: string;
    title: string;
    description: string;
    statement?: string | null;
  }>;
  pair_submission_history: Array<{
    id: string;
    team_id: string;
    is_current_team: boolean;
    round_id: string;
    round_number: number | null;
    github_link: string | null;
    file_url: string | null;
    overview: string | null;
    submitted_at: string;
  }>;
  submission: {
    _id: string;
    submitted_at: string;
    github_link?: string | null;
    file_url?: string | null;
    overview?: string | null;
    submission_text?: string | null;
    submitted_by_team_id?: string;
  } | null;
  score: null;
};

export type PairSubmissionsResponse = Array<{
  id: string;
  round_id: string;
  round_number: number | null;
  team_id: string;
  team_name: string;
  github_link: string | null;
  file_url: string | null;
  overview: string | null;
  submitted_at: string;
}>;

export type RoundTeamsResponse = {
  teams_by_track: Record<string, RoundTeam[]>;
  total_teams: number;
  current_round_number?: number | null;
  previous_round_number?: number | null;
};

export type JudgeAssignment = {
  judgeId: string;
  teamIds: string[];
  roundId: string;
};
