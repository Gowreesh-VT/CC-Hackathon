/**
 * GET /api/team/dashboard
 *
 * Returns the team's dashboard info:
 *  - team_name, track
 *  - current active round (name, timer, status)
 *  - round instructions
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";

export async function GET(request: NextRequest) {
    try {
        const { teamId } = await getTeamSession();

        await connectDB();

        const team = await Team.findById(teamId).populate("rounds_accessible");

        if (!team) {
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 }
            );
        }

        const accessibleRoundIds = team.rounds_accessible.map(
            (r: any) => r._id ?? r
        );

        const activeRound = await Round.findOne({
            _id: { $in: accessibleRoundIds },
            is_active: true,
        });

        return NextResponse.json({
            team_name: team.team_name,
            track: team.track,
            current_round: activeRound
                ? {
                    _id: activeRound._id,
                    round_number: activeRound.round_number,
                    start_time: activeRound.start_time,
                    end_time: activeRound.end_time,
                    is_active: activeRound.is_active,
                    submission_enabled: activeRound.submission_enabled,
                }
                : null,
            rounds_accessible: accessibleRoundIds,
        });

    // Caatch any errors
    } catch (err: any) {
        if (err.status && err.error) {
            return NextResponse.json(
                { error: err.error },
                { status: err.status }
            );
        }
        console.error("GET /api/team/dashboard error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
