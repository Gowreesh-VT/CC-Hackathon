type TeamRoundTotals = {
  round1: number;
  round2: number;
  total: number;
};

type PriorityResolutionInput = {
  teamAId: string;
  teamBId: string;
  teamATotals: TeamRoundTotals;
  teamBTotals: TeamRoundTotals;
};

export function resolvePriorityFromTotals({
  teamAId,
  teamBId,
  teamATotals,
  teamBTotals,
}: PriorityResolutionInput) {
  if (teamATotals.total !== teamBTotals.total) {
    return teamATotals.total > teamBTotals.total
      ? { priorityTeamId: teamAId, pairedTeamId: teamBId }
      : { priorityTeamId: teamBId, pairedTeamId: teamAId };
  }

  if (teamATotals.round2 !== teamBTotals.round2) {
    return teamATotals.round2 > teamBTotals.round2
      ? { priorityTeamId: teamAId, pairedTeamId: teamBId }
      : { priorityTeamId: teamBId, pairedTeamId: teamAId };
  }

  return teamAId < teamBId
    ? { priorityTeamId: teamAId, pairedTeamId: teamBId }
    : { priorityTeamId: teamBId, pairedTeamId: teamAId };
}

export type { TeamRoundTotals };
