import mongoose, { Document, Schema } from "mongoose";

export interface IPairing extends Document {
  round_anchor_id: mongoose.Types.ObjectId;
  track_id: mongoose.Types.ObjectId;
  team_a_id: mongoose.Types.ObjectId;
  team_b_id: mongoose.Types.ObjectId;
  team_member_ids: mongoose.Types.ObjectId[];
  pair_key: string;
  created_at: Date;
  updated_at: Date;
}

const PairingSchema = new Schema<IPairing>({
  round_anchor_id: { type: Schema.Types.ObjectId, ref: "Round", required: true },
  track_id: { type: Schema.Types.ObjectId, ref: "Track", required: true },
  team_a_id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  team_b_id: {
    type: Schema.Types.ObjectId,
    ref: "Team",
    required: true,
    validate: {
      validator: function sameTeamCheck(value: mongoose.Types.ObjectId) {
        return (this as any).team_a_id?.toString() !== value?.toString();
      },
      message: "Cannot pair a team with itself",
    },
  },
  team_member_ids: [{ type: Schema.Types.ObjectId, ref: "Team", required: true }],
  pair_key: { type: String, required: true },
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

// pair_key is "{sortedId1}:{sortedId2}" — enforces unique pairs per round
PairingSchema.index({ round_anchor_id: 1, pair_key: 1 }, { unique: true });

const Pairing =
  mongoose.models.Pairing || mongoose.model<IPairing>("Pairing", PairingSchema);

export default Pairing;
