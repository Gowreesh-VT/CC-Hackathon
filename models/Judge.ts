import mongoose, { Schema, Document, models, model } from "mongoose"

export interface IJudge extends Document {
  user_id: mongoose.Types.ObjectId
  name: string
  created_at: Date
}

const JudgeSchema = new Schema<IJudge>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  created_at: {
    type: Date,
    default: Date.now,
  },
})

export default models.Judge || model<IJudge>("Judge", JudgeSchema)