import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IJudgeAssignment extends Document {
  judge_id: mongoose.Types.ObjectId;
  round_id: mongoose.Types.ObjectId;
  team_ids: mongoose.Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

const JudgeAssignmentSchema = new Schema<IJudgeAssignment>({
  judge_id: {
    type: Schema.Types.ObjectId,
    ref: "Judge",
    required: true,
  },
  round_id: {
    type: Schema.Types.ObjectId,
    ref: "Round",
    required: true,
  },
  team_ids: [{ type: Schema.Types.ObjectId, ref: "Team", default: [] }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

JudgeAssignmentSchema.index({ judge_id: 1, round_id: 1 }, { unique: true });

export default models.JudgeAssignment ||
  model<IJudgeAssignment>("JudgeAssignment", JudgeAssignmentSchema);
