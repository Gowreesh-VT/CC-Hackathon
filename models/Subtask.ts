import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ISubtask extends Document {
  title: string;
  description: string;
  track: string;
  round_id: mongoose.Types.ObjectId;
  is_active: boolean;
  created_at: Date;
}

const SubtaskSchema = new Schema<ISubtask>({
  title: String,
  description: String,
  track: String,
  round_id: {
    type: Schema.Types.ObjectId,
    ref: "Round",
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export default models.Subtask || model<ISubtask>("Subtask", SubtaskSchema);
