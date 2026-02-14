import { baseApi } from "./baseApi";
import type {
  AdminDashboard,
  Round,
  Subtask,
  TeamDetail,
  Judge,
  RoundTeamSelection,
} from "./types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<AdminDashboard, void>({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getRounds: builder.query<Round[], void>({
      query: () => "/admin/rounds",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Round" as const, id })),
              { type: "Round", id: "LIST" },
            ]
          : [{ type: "Round", id: "LIST" }],
    }),
    createRound: builder.mutation<Round, Partial<Round>>({
      query: (body) => ({ url: "/admin/rounds", method: "POST", body }),
      invalidatesTags: [{ type: "Round", id: "LIST" }],
    }),
    deleteRound: builder.mutation<void, string>({
      query: (roundId) => ({ url: `/admin/rounds/${roundId}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [{ type: "Round", id }, { type: "Round", id: "LIST" }],
    }),
    startRound: builder.mutation<void, string>({
      query: (roundId) => ({
        url: `/admin/rounds/${roundId}/start`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminDashboard", { type: "Round", id: "LIST" }],
    }),
    stopRound: builder.mutation<void, string>({
      query: (roundId) => ({
        url: `/admin/rounds/${roundId}/stop`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminDashboard", { type: "Round", id: "LIST" }],
    }),
    toggleRoundSubmission: builder.mutation<void, string>({
      query: (roundId) => ({
        url: `/admin/rounds/${roundId}/toggle-submission`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminDashboard", { type: "Round", id: "LIST" }],
    }),
    getRoundSubtasks: builder.query<Subtask[], string>({
      query: (roundId) => `/admin/rounds/${roundId}/subtasks`,
      providesTags: (_result, _err, roundId) => [
        { type: "Round", id: roundId },
        { type: "Round", id: "SUBTASKS" },
      ],
    }),
    createSubtask: builder.mutation<
      Subtask,
      { roundId: string; title: string; description: string }
    >({
      query: ({ roundId, ...body }) => ({
        url: `/admin/rounds/${roundId}/subtasks`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, { roundId }) => [
        { type: "Round", id: roundId },
        { type: "Round", id: "SUBTASKS" },
      ],
    }),
    updateSubtask: builder.mutation<
      Subtask,
      { subtaskId: string; title?: string; description?: string }
    >({
      query: ({ subtaskId, ...body }) => ({
        url: `/admin/subtasks/${subtaskId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Round", id: "SUBTASKS" }],
    }),
    deleteSubtask: builder.mutation<void, string>({
      query: (subtaskId) => ({
        url: `/admin/subtasks/${subtaskId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Round", id: "SUBTASKS" }],
    }),
    getRoundTeamSelections: builder.query<RoundTeamSelection[], string>({
      query: (roundId) => `/admin/rounds/${roundId}/selections`,
      providesTags: (_result, _err, roundId) => [
        { type: "Round", id: roundId },
        { type: "Round", id: "SELECTIONS" },
      ],
    }),
    getTeams: builder.query<TeamDetail[], void>({
      query: () => "/admin/teams",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Team" as const, id })),
              { type: "Team", id: "LIST" },
            ]
          : [{ type: "Team", id: "LIST" }],
    }),
    createTeam: builder.mutation<TeamDetail, Partial<TeamDetail>>({
      query: (body) => ({ url: "/admin/teams", method: "POST", body }),
      invalidatesTags: [{ type: "Team", id: "LIST" }],
    }),
    deleteTeam: builder.mutation<void, string>({
      query: (teamId) => ({ url: `/admin/teams/${teamId}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [{ type: "Team", id }, { type: "Team", id: "LIST" }],
    }),
    lockTeamSubmission: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/admin/teams/${teamId}/lock`,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Team", id: "LIST" }],
    }),
    shortlistTeam: builder.mutation<void, string>({
      query: (teamId) => ({
        url: `/admin/teams/${teamId}/shortlist`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Team", id: "LIST" }],
    }),
    getJudges: builder.query<Judge[], void>({
      query: () => "/admin/judges",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Judge" as const, id })),
              { type: "Judge", id: "LIST" },
            ]
          : [{ type: "Judge", id: "LIST" }],
    }),
    createJudge: builder.mutation<Judge, { name: string; email: string }>({
      query: (body) => ({ url: "/admin/judges", method: "POST", body }),
      invalidatesTags: [{ type: "Judge", id: "LIST" }],
    }),
    deleteJudge: builder.mutation<void, string>({
      query: (judgeId) => ({
        url: `/admin/judges/${judgeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [{ type: "Judge", id }, { type: "Judge", id: "LIST" }],
    }),
    assignTeamsToJudge: builder.mutation<
      void,
      { judgeId: string; teamIds: string[]; roundId: string }
    >({
      query: ({ judgeId, teamIds }) => ({
        url: `/admin/judges/${judgeId}/assign`,
        method: "POST",
        body: { teamIds },
      }),
      invalidatesTags: [{ type: "Judge", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetRoundsQuery,
  useCreateRoundMutation,
  useDeleteRoundMutation,
  useStartRoundMutation,
  useStopRoundMutation,
  useToggleRoundSubmissionMutation,
  useGetRoundSubtasksQuery,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useGetRoundTeamSelectionsQuery,
  useGetTeamsQuery,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useLockTeamSubmissionMutation,
  useShortlistTeamMutation,
  useGetJudgesQuery,
  useCreateJudgeMutation,
  useDeleteJudgeMutation,
  useAssignTeamsToJudgeMutation,
} = adminApi;
