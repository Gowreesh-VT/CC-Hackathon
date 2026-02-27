export const ROUND_NUMBERS = {
  ROUND_1: 1,
  ROUND_2: 2,
  ROUND_3: 3,
  ROUND_4: 4,
} as const;

export function isRound2(roundNumber?: number | null): boolean {
  return roundNumber === ROUND_NUMBERS.ROUND_2;
}

export function isRound3(roundNumber?: number | null): boolean {
  return roundNumber === ROUND_NUMBERS.ROUND_3;
}

export function isRound4(roundNumber?: number | null): boolean {
  return roundNumber === ROUND_NUMBERS.ROUND_4;
}

/**
 * Returns true if the team is allowed to view the given round.
 * Round 1 is accessible to all teams while the round is active
 * or if the team has been explicitly granted access.
 * All other rounds require explicit shortlisting.
 */
export function canAccessRound(team: { rounds_accessible?: any[] }, round: { round_number: number; is_active: boolean; _id: any }): boolean {
  const accessibleRoundIds = new Set(
    (team.rounds_accessible || []).map((rid: any) => rid.toString()),
  );

  if (round.round_number === ROUND_NUMBERS.ROUND_1) {
    return round.is_active || accessibleRoundIds.has(round._id.toString());
  }

  return accessibleRoundIds.has(round._id.toString());
}
