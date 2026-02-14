import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  subtask_id: { type: Schema.Types.ObjectId, ref: "Subtask" },
  shown_at: { type: Date, default: Date.now },
})

export default models.TeamSubtaskDisplay || model("TeamSubtaskDisplay", SchemaObj)