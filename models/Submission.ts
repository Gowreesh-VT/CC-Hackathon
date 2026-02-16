import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  file_url: String,
  github_link: String,
  overview: String,
  submitted_at: { type: Date, default: Date.now },
  is_locked: { type: Boolean, default: false },
})

export default models.Submission || model("Submission", SchemaObj)