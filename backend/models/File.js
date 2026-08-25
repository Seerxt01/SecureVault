const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isEncrypted: { type: Boolean, default: false },
    encryptionIv: { type: String, default: null },
    encryptionAuthTag: { type: String, default: null }, // NEW - required to decrypt GCM ciphertext
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);