import { baseApi } from "./baseApi";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamDashboard: builder.query<any, void>({
      query: () => "/team/dashboard",
      providesTags: ["Team", "Round"],
    }),
    getTeamRounds: builder.query<any[], void>({
      query: () => "/team/rounds",
      providesTags: ["Round"],
    }),
    getTeamRoundDetails: builder.query<any, string>({
      query: (id) => `/team/rounds/${id}`,
      providesTags: (result, error, id) => [{ type: "Round", id }],
    }),
    selectSubtask: builder.mutation<
      any,
      { roundId: string; subtaskId: string }
    >({
      query: ({ roundId, subtaskId }) => ({
        url: "/team/selection",
        method: "POST",
        body: { roundId, subtaskId },
      }),
      invalidatesTags: (result, error, { roundId }) => [
        { type: "Round", id: roundId },
      ],
    }),
    getTeamSubmissions: builder.query<any[], void>({
      query: () => "/team/submission",
      providesTags: ["Submission"],
    }),
    submitProject: builder.mutation<any, any>({
      query: (body) => ({
        url: "/team/submission",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Submission", "Round"],
    }),
    updateSubmission: builder.mutation<any, any>({
      query: (body) => ({
        url: "/team/submission",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Submission", "Round"],
    }),
  }),
});

export const {
  useGetTeamDashboardQuery,
  useGetTeamRoundsQuery,
  useGetTeamRoundDetailsQuery,
  useSelectSubtaskMutation,
  useGetTeamSubmissionsQuery,
  useSubmitProjectMutation,
  useUpdateSubmissionMutation,
} = teamApi;
