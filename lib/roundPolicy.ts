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

type RoundAccessRef = {
  _id: any;
  round_number: number;
};

export function getEffectiveAccessibleRoundIds(
  team: { rounds_accessible?: any[] },
  roundsContext: RoundAccessRef[] = [],
): Set<string> {
  const toIdString = (value: any): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value._id) return value._id.toString();
    if (typeof value.toString === "function") return value.toString();
    return null;
  };

  const accessibleRoundIds = new Set(
    (team.rounds_accessible || [])
      .map((rid: any) => toIdString(rid))
      .filter(Boolean) as string[],
  );

  if (roundsContext.length === 0) {
    return accessibleRoundIds;
  }

  const round2 = roundsContext.find((r) => r.round_number === ROUND_NUMBERS.ROUND_2);
  if (!round2 || !accessibleRoundIds.has(round2._id.toString())) {
    return accessibleRoundIds;
  }

  // Business rule: teams shortlisted for Round 2 continue to Rounds 3 and 4.
  roundsContext
    .filter((r) => r.round_number === ROUND_NUMBERS.ROUND_3 || r.round_number === ROUND_NUMBERS.ROUND_4)
    .forEach((r) => accessibleRoundIds.add(r._id.toString()));

  return accessibleRoundIds;
}

/**
 * Returns true if the team is allowed to view the given round.
 * Round 1 is accessible to all teams while the round is active
 * or if the team has been explicitly granted access.
 * All other rounds require explicit shortlisting.
 */
export function canAccessRound(
  team: { rounds_accessible?: any[] },
  round: { round_number: number; is_active: boolean; _id: any },
  roundsContext: RoundAccessRef[] = [],
): boolean {
  const accessibleRoundIds = getEffectiveAccessibleRoundIds(
    team,
    roundsContext,
  );

  if (round.round_number === ROUND_NUMBERS.ROUND_1) {
    return round.is_active || accessibleRoundIds.has(round._id.toString());
  }

  return accessibleRoundIds.has(round._id.toString());
}
