import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  judge_id: { type: Schema.Types.ObjectId, ref: "Judge" },
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  score: Number,
  remarks: String,
  updated_at: { type: Date, default: Date.now },
})

SchemaObj.index(
  { judge_id: 1, team_id: 1, round_id: 1 },
  { unique: true }
)

export default models.Score || model("Score", SchemaObj)