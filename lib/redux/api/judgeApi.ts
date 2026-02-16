import { baseApi } from "./baseApi";

export const judgeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getJudgeAssignedTeams: builder.query<any[], string | void>({ // Returns array of teams
            query: (roundId) => roundId ? `/judge/assigned-teams?round_id=${roundId}` : `/judge/assigned-teams`,
            providesTags: ["Judge"],
        }),
        // The specific route requested: `/api/judge/rounds/${roundId}/teams/${teamId}`
        getJudgeTeamDetails: builder.query<any, { roundId: string; teamId: string }>({
            query: ({ roundId, teamId }) => `/judge/rounds/${roundId}/teams/${teamId}`,
            providesTags: ["Judge"],
        }),
        submitScore: builder.mutation<any, { roundId: string; teamId: string; scores: any }>({
            query: ({ roundId, teamId, scores }) => ({
                url: `/judge/rounds/${roundId}/teams/${teamId}`,
                method: "POST",
                body: scores,
            }),
            invalidatesTags: ["Judge", "Team", "AdminDashboard"],
        }),
    }),
});

export const {
    useGetJudgeAssignedTeamsQuery,
    useGetJudgeTeamDetailsQuery,
    useSubmitScoreMutation,
} = judgeApi;
