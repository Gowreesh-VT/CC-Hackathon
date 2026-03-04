import mongoose, { Schema, Document, models, model } from "mongoose";
import "./Subtask";

export interface IRoundOptions extends Document {
  team_id: mongoose.Types.ObjectId;
  round_id: mongoose.Types.ObjectId;
  assignment_mode?: "team" | "pair";
  pair_id?: mongoose.Types.ObjectId | null;
  priority_team_id?: mongoose.Types.ObjectId | null;
  paired_team_id?: mongoose.Types.ObjectId | null;
  published_at?: Date | null;
  auto_assigned?: boolean;
  options: mongoose.Types.ObjectId[];
  selected: mongoose.Types.ObjectId | null;
  selected_at?: Date;
  created_at: Date;
}

const RoundOptionsSchema = new Schema<IRoundOptions>({
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  assignment_mode: {
    type: String,
    enum: ["team", "pair"],
    default: "team",
  },
  pair_id: { type: Schema.Types.ObjectId, ref: "Pairing", default: null },
  priority_team_id: { type: Schema.Types.ObjectId, ref: "Team", default: null },
  paired_team_id: { type: Schema.Types.ObjectId, ref: "Team", default: null },
  published_at: { type: Date, default: null },
  auto_assigned: { type: Boolean, default: false },
  options: [{ type: Schema.Types.ObjectId, ref: "Subtask", default: [] }],
  selected: { type: Schema.Types.ObjectId, ref: "Subtask", default: null },
  selected_at: { type: Date },
  created_at: { type: Date, default: Date.now },
});

// Prevent concurrent upserts from creating duplicate (team_id, round_id) docs
RoundOptionsSchema.index({ team_id: 1, round_id: 1 }, { unique: true });

export default models.RoundOptions ||
  model<IRoundOptions>("RoundOptions", RoundOptionsSchema);
