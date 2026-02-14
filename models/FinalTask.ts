import mongoose, { Schema, models, model } from "mongoose"

const SchemaObj = new Schema({
  title: String,
  description: String,
  is_released: { type: Boolean, default: false },
  released_at: Date,
})

export default models.FinalTask || model("FinalTask", SchemaObj)