import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: "Team" },
  round_id: { type: Schema.Types.ObjectId, ref: "Round" },
  subtask_id: { type: Schema.Types.ObjectId, ref: "Subtask" },
  selected_at: { type: Date, default: Date.now },
})

SchemaObj.index({ team_id: 1, round_id: 1 }, { unique: true })

export default models.TeamSubtaskSelection || model("TeamSubtaskSelection", SchemaObj)

