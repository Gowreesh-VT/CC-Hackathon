import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  shortlisted_at: { type: Date, default: Date.now },
})

export default models.ShortlistedTeam || model("ShortlistedTeam", SchemaObj)