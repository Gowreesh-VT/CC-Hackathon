import { baseApi } from "./baseApi";
import { Round, Team, AdminDashboard, TeamDetail } from "./types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboard, void>({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getAdminRounds: builder.query<Round[], void>({
      query: () => "/admin/rounds",
      providesTags: ["Round"],
    }),
    createRound: builder.mutation<Round, Partial<Round>>({
      query: (body) => ({
        url: "/admin/rounds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Round"],
    }),
    getRoundDetails: builder.query<Round, string>({
      query: (id) => `/admin/rounds/${id}`,
      providesTags: (result, error, id) => [{ type: "Round", id }],
    }),
    updateRound: builder.mutation<Round, { id: string; body: Partial<Round> }>({
      query: ({ id, body }) => ({
        url: `/admin/rounds/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Round", id },
        "Round",
      ],
    }),
    toggleRoundStatus: builder.mutation<
      any,
      { id: string; action: "start" | "stop" | "toggle-submission" }
    >({
      query: ({ id, action }) => ({
        url: `/admin/rounds/${id}`,
        method: "PATCH",
        body: { action },
      }),
      invalidatesTags: ["Round", "AdminDashboard"],
    }),
    deleteRound: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/rounds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Round"],
    }),
    getRoundTeams: builder.query<
      { teams: any[]; allowedTeamIds: string[] },
      string
    >({
      query: (roundId) => `/admin/rounds/${roundId}/teams`,
      providesTags: (result, error, roundId) => [
        { type: "Round", id: roundId },
      ],
    }),
    updateRoundTeams: builder.mutation<
      { message: string; allowedTeamIds: string[] },
      { roundId: string; teamIds: string[] }
    >({
      query: ({ roundId, teamIds }) => ({
        url: `/admin/rounds/${roundId}/teams`,
        method: "POST",
        body: { teamIds },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
      ],
    }),
    getRoundTeamSubtasks: builder.query<
      { assignments: { teamId: string; subtaskIds: string[] }[] },
      string
    >({
      query: (roundId) => `/admin/rounds/${roundId}/team-subtasks`,
      providesTags: (result, error, roundId) => [
        { type: "Round", id: `subtasks_${roundId}` },
      ],
    }),
    updateRoundTeamSubtasks: builder.mutation<
      { message: string },
      {
        roundId: string;
        assignments: { teamId: string; subtaskIds: string[] }[];
      }
    >({
      query: ({ roundId, assignments }) => ({
        url: `/admin/rounds/${roundId}/team-subtasks`,
        method: "POST",
        body: { assignments },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: `subtasks_${roundId}` },
      ],
    }),
    getAdminTeams: builder.query<TeamDetail[], void>({
      query: () => "/admin/teams",
      providesTags: ["Team"],
    }),
    createTeam: builder.mutation<Team, Partial<Team>>({
      query: (body) => ({
        url: "/admin/teams",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Team", "AdminDashboard"],
    }),
    updateTeamStatus: builder.mutation<Team, { id: string; updates: any }>({
      query: ({ id, updates }) => ({
        url: `/admin/teams/${id}`,
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["Team"],
    }),
    getTeamDetails: builder.query<any, string>({
      // Using any for now as details structure is complex
      query: (id) => `/admin/teams/${id}/details`,
      providesTags: (result, error, id) => [{ type: "Team", id }],
    }),
    getSubtasks: builder.query<any[], string>({
      query: (roundId) => `/admin/subtasks?round_id=${roundId}`,
      providesTags: (result, error, roundId) => [
        { type: "Round", id: roundId },
      ],
    }),
    createSubtask: builder.mutation<
      any,
      { round_id: string; title: string; description?: string; track?: string }
    >({
      query: (body) => ({
        url: "/admin/subtasks",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { round_id }) => [
        { type: "Round", id: round_id },
      ],
    }),
    updateSubtask: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/admin/subtasks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { body }) => [
        { type: "Round", id: body?.round_id },
      ],
    }),
    deleteSubtask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/subtasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Round"],
    }),
    getJudges: builder.query<any[], void>({
      query: () => "/admin/judges",
      providesTags: ["Judge"],
    }),
    createJudge: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/admin/judges",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Judge"],
    }),
    deleteJudge: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/judges/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Judge"],
    }),
    updateJudge: builder.mutation<
      any,
      { id: string; name: string; email: string }
    >({
      query: ({ id, name, email }) => ({
        url: `/admin/judges/${id}`,
        method: "PATCH",
        body: { name, email },
      }),
      invalidatesTags: ["Judge"],
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
      invalidatesTags: ["Judge"],
    }),
    getJudgeAssignmentsForRound: builder.query<
      { assignments: any[]; assignedTeamIds: string[] },
      string
    >({
      query: (roundId) => `/admin/judges/assignments?round_id=${roundId}`,
      providesTags: (result, error, roundId) => [
        { type: "Judge", id: `round_${roundId}` },
      ],
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
  useGetRoundTeamSubtasksQuery,
  useUpdateRoundTeamSubtasksMutation,
  useGetAdminTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamStatusMutation,
  useGetTeamDetailsQuery,
  useGetSubtasksQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetJudgesQuery,
  useCreateJudgeMutation,
  useDeleteJudgeMutation,
  useUpdateJudgeMutation,
  useAssignTeamsToJudgeMutation,
  useGetJudgeAssignmentsForRoundQuery,
} = adminApi;
