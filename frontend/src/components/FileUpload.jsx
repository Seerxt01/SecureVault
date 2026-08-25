import { useState, useEffect } from "react";
import apiClient from "../api/client";

function FileUpload({ accessToken }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState({ message: "", isError: false });
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await apiClient.get("/files", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFiles(res.data.files);
    } catch (err) {
      setStatus({ message: "Could not load files", isError: true });
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [accessToken]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus({ message: "Choose a file first", isError: true });
      return;
    }

    // File uploads must use FormData, not JSON - this is what lets the browser
    // send the raw file bytes as multipart/form-data, which Multer expects
    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploading(true);
    setStatus({ message: "", isError: false });
    try {
      await apiClient.post("/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus({ message: "File uploaded successfully", isError: false });
      setSelectedFile(null);
      fetchFiles(); // refresh the list to show the new file
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      setStatus({ message: msg, isError: true });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await apiClient.delete(`/files/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchFiles();
    } catch (err) {
      setStatus({ message: "Could not delete file", isError: true });
    }
  };
  const handleDownload = async (fileId, originalName) => {
  try {
    const res = await apiClient.get(`/files/${fileId}/download`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "blob", // needed - the response is raw file bytes, not JSON
    });

    // Create a temporary link to trigger the browser's normal "save file" behavior
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    setStatus({ message: "Could not download file", isError: true });
  }
};

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="auth-card">
      <h3>Your Files</h3>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {status.message && (
        <p className={status.isError ? "error-text" : "success-text"}>{status.message}</p>
      )}

      <ul className="file-list">
        {files.length === 0 && <li className="note-text">No files uploaded yet.</li>}
        {files.map((f) => (
          <li key={f._id}>
  <span className="lock-dot"></span>
  <span className="file-name">{f.originalName}</span>
  <span className="file-meta">({formatSize(f.size)})</span>
  <div className="file-actions">
    <button className="link-btn" onClick={() => handleDownload(f._id, f.originalName)}>
      Download
    </button>
    <button className="link-btn danger" onClick={() => handleDelete(f._id)}>
      Delete
    </button>
  </div>
</li>
        ))}
      </ul>
    </div>
  );
}

export default FileUpload;