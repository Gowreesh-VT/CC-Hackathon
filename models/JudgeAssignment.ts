import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  judge_id: { type: Schema.Types.ObjectId, ref: "Judge" },
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  assigned_at: { type: Date, default: Date.now },
})

export default models.JudgeAssignment || model("JudgeAssignment", SchemaObj)