const File = require("../models/File");
const fs = require("fs");
const path = require("path");
const { encryptBuffer, decryptBuffer } = require("../utils/encryption");
const logAction = require("../utils/logAction");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// POST /api/files/upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(req.file.originalname);
    const storedName = `${uniqueSuffix}${ext}`;

    const { encrypted, iv, authTag } = encryptBuffer(req.file.buffer);

    fs.writeFileSync(path.join(UPLOAD_DIR, storedName), encrypted);

    const newFile = await File.create({
      originalName: req.file.originalname,
      storedName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user.id,
      isEncrypted: true,
      encryptionIv: iv.toString("hex"),
      encryptionAuthTag: authTag.toString("hex"),
    });

    await logAction({
      action: "FILE_UPLOAD",
      user: req.user.id,
      username: req.user.username,
      req,
      details: newFile.originalName,
    });

    return res.status(201).json({
      message: "File uploaded and encrypted successfully",
      file: {
        id: newFile._id,
        originalName: newFile.originalName,
        mimeType: newFile.mimeType,
        size: newFile.size,
        uploadedAt: newFile.createdAt,
      },
    });
  } catch (err) {
    console.error("uploadFile error:", err.message);
    return res.status(500).json({ message: "Server error during file upload" });
  }
};

// GET /api/files
const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user.id })
      .select("-storedName -encryptionIv -encryptionAuthTag")
      .sort({ createdAt: -1 });
    return res.status(200).json({ files });
  } catch (err) {
    console.error("getMyFiles error:", err.message);
    return res.status(500).json({ message: "Server error fetching files" });
  }
};

// GET /api/files/:id/download
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      await logAction({
        action: "UNAUTHORIZED_ACCESS",
        user: req.user.id,
        username: req.user.username,
        req,
        details: `Attempted to access file ${file._id}`,
      });
      return res.status(403).json({ message: "Not authorized to access this file" });
    }

    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File missing from storage" });
    }

    const encryptedData = fs.readFileSync(filePath);
    const iv = Buffer.from(file.encryptionIv, "hex");
    const authTag = Buffer.from(file.encryptionAuthTag, "hex");

    const decrypted = decryptBuffer(encryptedData, iv, authTag);

    await logAction({
      action: "FILE_DOWNLOAD",
      user: req.user.id,
      username: req.user.username,
      req,
      details: file.originalName,
    });

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
    return res.send(decrypted);
  } catch (err) {
    console.error("downloadFile error:", err.message);
    return res.status(500).json({ message: "Server error during file download" });
  }
};

// DELETE /api/files/:id
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this file" });
    }

    const filePath = path.join(UPLOAD_DIR, file.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    await logAction({
      action: "FILE_DELETE",
      user: req.user.id,
      username: req.user.username,
      req,
      details: file.originalName,
    });

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("deleteFile error:", err.message);
    return res.status(500).json({ message: "Server error deleting file" });
  }
};

module.exports = { uploadFile, getMyFiles, deleteFile, downloadFile };