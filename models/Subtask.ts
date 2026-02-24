import mongoose, { Schema, Document } from "mongoose";

export interface ISubtask extends Document {
  title: string;
  description: string;
  track_id: mongoose.Types.ObjectId;
  is_active: boolean;
  created_at: Date;
}

const SubtaskSchema = new Schema<ISubtask>({
  title: String,
  description: String,
  track_id: {
    type: Schema.Types.ObjectId,
    ref: "Track",
    required: true,
  },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Subtask ||
  mongoose.model<ISubtask>("Subtask", SubtaskSchema);
