import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";

export async function getAssignedTeamIdsForJudgeRound(
  judgeId: string,
  roundId: string,
): Promise<string[]> {
  const roundAssignment = await JudgeAssignment.findOne({
    judge_id: judgeId,
    round_id: roundId,
  })
    .select("team_ids")
    .lean();

  if (roundAssignment) {
    return (roundAssignment.team_ids || []).map((id: any) => id.toString());
  }

  // Backward compatibility for data created before round-specific assignments.
  const judge = await Judge.findById(judgeId).select("teams_assigned").lean();
  return (judge?.teams_assigned || []).map((id: any) => id.toString());
}

export async function getAssignedTeamIdsForJudge(
  judgeId: string,
): Promise<string[]> {
  const roundAssignments = await JudgeAssignment.find({ judge_id: judgeId })
    .select("team_ids")
    .lean();

  if (roundAssignments.length > 0) {
    const unique = new Set<string>();
    roundAssignments.forEach((assignment: any) => {
      (assignment.team_ids || []).forEach((id: any) => unique.add(id.toString()));
    });
    return [...unique];
  }

  // Backward compatibility for data created before round-specific assignments.
  const judge = await Judge.findById(judgeId).select("teams_assigned").lean();
  return (judge?.teams_assigned || []).map((id: any) => id.toString());
}
