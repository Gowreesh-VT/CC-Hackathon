import mongoose, { Schema, Document, models, model } from "mongoose"

export interface ITeam extends Document {
  team_name: string
  track: string
  rounds_accessible: mongoose.Types.ObjectId[]
  created_at: Date
}

const TeamSchema = new Schema<ITeam>({
  team_name: { type: String, required: true },
  track: { type: String, required: true },
  rounds_accessible: [
    { type: Schema.Types.ObjectId, ref: "Round" },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
})

export default models.Team || model<ITeam>("Team", TeamSchema)