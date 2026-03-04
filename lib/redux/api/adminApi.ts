import { baseApi } from "./baseApi";
import {
  Round,
  Team,
  AdminDashboard,
  TeamDetail,
  Subtask,
  Judge,
  Track,
  RoundTeamsResponse,
  Pair,
} from "./types";

export const adminApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboard, void>({
      query: () => "/admin",
      providesTags: ["AdminDashboard"],
    }),
    getAdminRounds: builder.query<Round[], void>({
      query: () => "/admin/rounds",
      providesTags: ["Round"],
    }),
    createRound: builder.mutation<
      any,
      {
        round_number: number;
        instructions?: string;
        start_time?: string | null;
        end_time?: string | null;
      }
    >({
      query: (body) => ({
        url: "/admin/rounds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Round", "AdminDashboard"],
    }),
    getRoundDetails: builder.query<Round, string>({
      query: (id) => `/admin/rounds/${id}`,
      providesTags: (result, error, id) => [{ type: "Round", id }],
    }),
    updateRound: builder.mutation<
      Round,
      {
        id: string;
        body: {
          instructions?: string;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/rounds/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Round", id },
        "Round",
        "AdminDashboard",
      ],
    }),
    toggleRoundStatus: builder.mutation<
      any,
      { id: string; action: "start" | "stop" }
    >({
      query: ({ id, action }) => ({
        url: `/admin/rounds/${id}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Round", id },
        "Round",
        "AdminDashboard",
      ],
    }),
    deleteRound: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/rounds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Round", "AdminDashboard"],
    }),
    getRoundTeams: builder.query<RoundTeamsResponse, string>({
      query: (roundId) => `/admin/rounds/${roundId}/teams`,
      providesTags: (result, error, roundId) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    updateRoundTeams: builder.mutation<
      { message: string; shortlisted_count: number; mirrored_rounds?: number[] },
      { roundId: string; teamIds: string[] }
    >({
      query: ({ roundId, teamIds }) => ({
        url: `/admin/rounds/${roundId}/teams`,
        method: "POST",
        body: { teamIds },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    allocateSubtasksToTeams: builder.mutation<
      { message: string; count: number },
      { roundId: string; allocations: { teamId: string; subtaskIds: string[] }[] }
    >({
      query: ({ roundId, allocations }) => ({
        url: `/admin/rounds/${roundId}/allocate`,
        method: "POST",
        body: { allocations },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    getRoundPairs: builder.query<
      {
        paired: Pair[];
        unpaired_by_track: Record<string, Array<{ id: string; team_name: string; track: string; track_id: string | null }>>;
        shortlisted_count: number;
        paired_count: number;
        validation?: {
          odd_shortlist_count: boolean;
          unpaired_count: number;
        };
      },
      string
    >({
      query: (roundId) => `/admin/rounds/${roundId}/pairs`,
      providesTags: (result, error, roundId) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    createRoundPair: builder.mutation<
      { message: string; pair_id: string },
      { roundId: string; teamAId: string; teamBId: string }
    >({
      query: ({ roundId, teamAId, teamBId }) => ({
        url: `/admin/rounds/${roundId}/pairs`,
        method: "POST",
        body: { teamAId, teamBId },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    deleteRoundPair: builder.mutation<
      { message: string },
      { roundId: string; pairId: string }
    >({
      query: ({ roundId, pairId }) => ({
        url: `/admin/rounds/${roundId}/pairs/${pairId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    allocateSubtasksToPairs: builder.mutation<
      { message: string; count: number },
      { roundId: string; allocations: { pairId: string; subtaskIds: string[] }[] }
    >({
      query: ({ roundId, allocations }) => ({
        url: `/admin/rounds/${roundId}/allocate-pairs`,
        method: "POST",
        body: { allocations },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
        "Team",
      ],
    }),
    getTracks: builder.query<Track[], void>({
      query: () => "/admin/tracks",
      providesTags: ["Track"],
    }),
    createTrack: builder.mutation<
      any,
      { name: string; description?: string; is_active?: boolean }
    >({
      query: (body) => ({ url: "/admin/tracks", method: "POST", body }),
      invalidatesTags: ["Track"],
    }),
    updateTrack: builder.mutation<
      any,
      { id: string; name?: string; description?: string; is_active?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/tracks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Track"],
    }),
    deleteTrack: builder.mutation<any, string>({
      query: (id) => ({ url: `/admin/tracks/${id}`, method: "DELETE" }),
      invalidatesTags: ["Track"],
    }),
    getAdminTeams: builder.query<Team[], void>({
      query: () => "/admin/teams",
      providesTags: ["Team"],
    }),
    createTeam: builder.mutation<
      any,
      {
        team_name: string;
        email: string;
        mobile_number: string;
        team_size: number;
        track_id: string;
      }
    >({
      query: (body) => ({
        url: "/admin/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team", "AdminDashboard"],
    }),
    batchCreateTeams: builder.mutation<
      any,
      {
        teams: Array<{
          team_name: string;
          email: string;
          mobile_number: string;
          team_size: number;
          track_id: string;
        }>;
      }
    >({
      query: (body) => ({
        url: "/admin/teams/batch",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team", "AdminDashboard"],
    }),
    updateTeamStatus: builder.mutation<
      any,
      {
        id: string;
        updates: Partial<{
          team_name: string;
          email: string;
          mobile_number: string;
          team_size: number;
          track_id: string;
        }>;
      }
    >({
      query: ({ id, updates }) => ({
        url: `/admin/teams/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Team", id },
        "Team",
        "AdminDashboard",
      ],
    }),
    deleteTeam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/teams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Team", "AdminDashboard"],
    }),
    getTeamDetails: builder.query<TeamDetail, string>({
      query: (id) => `/admin/teams/${id}`,
      providesTags: (result, error, id) => [{ type: "Team", id }],
    }),
    getAllSubtasks: builder.query<Subtask[], void>({
      query: () => "/admin/subtasks",
      providesTags: ["Subtask"],
    }),
    createSubtask: builder.mutation<
      Subtask,
      { title: string; description: string; track_id: string; is_active?: boolean }
    >({
      query: (body) => ({
        url: "/admin/subtasks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subtask"],
    }),
    updateSubtask: builder.mutation<
      Subtask,
      {
        id: string;
        body: Partial<{
          title: string;
          description: string;
          track_id: string;
          is_active: boolean;
        }>;
      }
    >({
      query: ({ id, body }) => ({
        url: `/admin/subtasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Subtask", id },
        "Subtask",
      ],
    }),
    deleteSubtask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/subtasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subtask"],
    }),
    getJudges: builder.query<Judge[], void>({
      query: () => "/admin/judges",
      providesTags: ["Judge"],
    }),
    getJudgeDetails: builder.query<Judge, string>({
      query: (id) => `/admin/judges/${id}`,
      providesTags: (result, error, id) => [{ type: "Judge", id }],
    }),
    createJudge: builder.mutation<
      any,
      { judge_name: string; email: string; track_id: string }
    >({
      query: (body) => ({
        url: "/admin/judges",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Judge", "AdminDashboard"],
    }),
    deleteJudge: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/judges/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Judge", "JudgeAssignment", "AdminDashboard"],
    }),
    updateJudge: builder.mutation<
      any,
      { id: string; judge_name?: string; email?: string; track_id?: string }
    >({
      query: ({ id, judge_name, email, track_id }) => ({
        url: `/admin/judges/${id}`,
        method: "PATCH",
        body: { judge_name, email, track_id },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Judge", id },
        "Judge",
      ],
    }),
    assignTeamsToJudge: builder.mutation<
      any,
      { judgeId: string; teamIds: string[]; roundId?: string }
    >({
      query: ({ judgeId, teamIds, roundId }) => ({
        url: `/admin/judges/${judgeId}/assign`,
        method: "POST",
        body: { teamIds, roundId },
      }),
      invalidatesTags: ["Judge", "JudgeAssignment"],
    }),
    getJudgeAssignmentsForRound: builder.query<any, string>({
      query: (roundId) => `/admin/judges/assignments?round_id=${roundId}`,
      providesTags: (result, error, roundId) => [
        { type: "JudgeAssignment", id: `round_${roundId}` },
      ],
    }),
    createJudgeAssignment: builder.mutation<
      any,
      { judgeId: string; teamIds: string[]; roundId: string }
    >({
      query: ({ judgeId, teamIds, roundId }) => ({
        url: "/admin/judges/assignments",
        method: "POST",
        body: { judgeId, teamIds, roundId },
      }),
      invalidatesTags: ["JudgeAssignment"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminRoundsQuery,
  useCreateRoundMutation,
  useGetRoundDetailsQuery,
  useUpdateRoundMutation,
  useToggleRoundStatusMutation,
  useDeleteRoundMutation,
  useGetRoundTeamsQuery,
  useUpdateRoundTeamsMutation,
  useAllocateSubtasksToTeamsMutation,
  useGetRoundPairsQuery,
  useCreateRoundPairMutation,
  useDeleteRoundPairMutation,
  useAllocateSubtasksToPairsMutation,
  useGetTracksQuery,
  useCreateTrackMutation,
  useUpdateTrackMutation,
  useDeleteTrackMutation,
  useGetAdminTeamsQuery,
  useCreateTeamMutation,
  useBatchCreateTeamsMutation,
  useUpdateTeamStatusMutation,
  useDeleteTeamMutation,
  useGetTeamDetailsQuery,
  useGetAllSubtasksQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetJudgesQuery,
  useGetJudgeDetailsQuery,
  useCreateJudgeMutation,
  useDeleteJudgeMutation,
  useUpdateJudgeMutation,
  useAssignTeamsToJudgeMutation,
  useGetJudgeAssignmentsForRoundQuery,
  useCreateJudgeAssignmentMutation,
} = adminApi;
