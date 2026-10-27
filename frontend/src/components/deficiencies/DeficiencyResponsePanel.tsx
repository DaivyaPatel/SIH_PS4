import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Button } from '../common/Button';
import { respondToDeficiency } from '../../lib/api';
import { useRole } from '../../context/RoleContext';
import { useToast } from '../../context/ToastContext';

interface DeficiencyResponsePanelProps {
  caseId: string;
  deficiencyId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function DeficiencyResponsePanel({
  caseId,
  deficiencyId,
  onSuccess,
  onCancel,
}: DeficiencyResponsePanelProps) {
  const { role } = useRole();
  const { addToast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [comment, setComment] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setError('Only PDF, JPG, or PNG compliance documents are accepted per APH guidelines.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Document file size exceeds the 20MB regulatory statutory limit.');
      return;
    }

    setFileName(file.name);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(`${sizeMb} MB`);

    // Simulate realistic upload progress
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 35;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError('A certified proof document is required to substantiate compliance.');
      return;
    }
    if (!comment.trim()) {
      setError('Please provide an explanatory response comment detailing how the deficiency was cured.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await respondToDeficiency(caseId, deficiencyId, {
        responseComment: comment.trim(),
        proofDocumentName: fileName.trim(),
        proofDocumentUrl: `https://storage.aicte.gov.in/proofs/${encodeURIComponent(fileName.trim())}`,
        actorRole: role,
        actorId: `${role}-REP`,
      });

      addToast({
        type: 'success',
        title: 'Compliance Proof Submitted',
        message: 'Your proof document and explanatory remarks have been registered for Scrutiny Officer verification.',
      });

      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit deficiency response';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px dashed var(--accent-border)',
        borderRadius: 8,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          Submit Compliance Response & Supporting Proof
        </h4>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 2,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* File Dropzone */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1.5px dashed ${isDragging ? 'var(--accent)' : 'var(--border-strong)'}`,
          background: isDragging ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
          borderRadius: 6,
          padding: '16px 12px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        <UploadCloud size={28} style={{ color: 'var(--accent)', marginBottom: 6 }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          Click to upload or drag & drop proof document
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Supported: Certified PDF, scanned clearance certificates, JPG (Max 20MB)
        </div>
      </div>

      {/* Uploaded File Chip & Progress */}
      {fileName && (
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                {fileName}
              </span>
              {fileSize && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({fileSize})</span>
              )}
            </div>
            {uploadProgress === 100 && (
              <CheckCircle2 size={16} style={{ color: 'var(--status-ok-solid)' }} />
            )}
          </div>

          {uploadProgress !== null && uploadProgress < 100 && (
            <div
              style={{
                height: 4,
                width: '100%',
                background: 'var(--border)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'var(--accent)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Explanatory Response Comment */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Institutional Explanation & Compliance Notes <span style={{ color: 'var(--status-bad)' }}>*</span>
        </label>
        <textarea
          rows={3}
          placeholder="State clearly how the cited deficiency has been cured (e.g. registered lease renewed for 5 years, appointment orders issued, new FDR receipt submitted)..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>

      {error && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--status-bad-text)',
            background: 'var(--status-bad-tint)',
            border: '1px solid var(--status-bad-border)',
            borderRadius: 6,
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {onCancel && (
          <Button variant="ghost" size="sm" type="button" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={loading}
          leftIcon={<UploadCloud size={14} />}
        >
          Submit Compliance Proof
        </Button>
      </div>
    </form>
  );
}
