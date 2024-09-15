import mongoose from "mongoose";

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  speciality: { type: String, required: true },
  location: {type: String, required: true},
  address: {type: String, required: true},
  balance: {type: Number, required: true},
  availabilityID: { type: String },
}, { timestamps: true });

export const Provider = mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);