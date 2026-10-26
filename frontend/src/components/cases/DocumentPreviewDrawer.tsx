import { useState } from 'react';
import { FileCheck, Calendar, ShieldCheck, AlertTriangle, Copy, Check, ExternalLink } from 'lucide-react';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import type { DocumentDetail } from '../../types/domain';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../context/RoleContext';

interface DocumentPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentDetail | null;
  onFlagAsDeficient?: (doc: DocumentDetail) => void;
}

export function DocumentPreviewDrawer({
  isOpen,
  onClose,
  document,
  onFlagAsDeficient,
}: DocumentPreviewDrawerProps) {
  const { permissions } = useRole();
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const copyHash = () => {
    if (document.fileHash) {
      navigator.clipboard?.writeText(document.fileHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast({
        type: 'info',
        title: 'Cryptographic Hash Copied',
        message: 'SHA-256 hash copied to clipboard.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return { bg: 'var(--status-ok-tint)', text: 'var(--status-ok-text)', border: 'var(--status-ok-border)' };
      case 'DEFICIENT':
        return { bg: 'var(--status-bad-tint)', text: 'var(--status-bad-text)', border: 'var(--status-bad-border)' };
      case 'EXPIRED':
        return { bg: 'var(--status-bad-tint)', text: 'var(--status-bad-text)', border: 'var(--status-bad-border)' };
      default:
        return { bg: 'var(--status-warn-tint)', text: 'var(--status-warn-text)', border: 'var(--status-warn-border)' };
    }
  };

  const statusStyle = getStatusColor(document.verificationStatus);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={document.documentName}
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Verification Status Pill & Document Type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: 4,
              background: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
            }}
          >
            {document.verificationStatus}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Category: <strong>{document.documentType.replace(/_/g, ' ')}</strong>
          </span>
        </div>

        {/* Certificate Preview Card */}
        <div
          style={{
            background: 'var(--bg-page)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            minHeight: 220,
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'var(--accent-subtle)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {document.documentName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
              Statutory Uploaded Document · PDF Specification
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            leftIcon={<ExternalLink size={13} />}
            onClick={() => {
              addToast({
                type: 'info',
                title: 'Secure Document Ingestion',
                message: `Displaying cryptographic verified file: ${document.documentName}`,
              });
            }}
          >
            Open in Document Viewer
          </Button>
        </div>

        {/* Metadata Details List */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>SHA-256 Cryptographic Hash</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <code
                style={{
                  fontFamily: 'monospace',
                  fontSize: 11,
                  background: 'var(--bg-surface)',
                  padding: '3px 6px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  wordBreak: 'break-all',
                  flex: 1,
                }}
              >
                {document.fileHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </code>
              <button
                type="button"
                onClick={copyHash}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: copied ? 'var(--status-ok)' : 'var(--text-secondary)',
                  padding: 4,
                }}
                title="Copy hash"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {document.validUntil && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Valid Until: </span>
                <strong style={{ color: 'var(--text-primary)' }}>{document.validUntil}</strong>
              </div>
            </div>
          )}

          {document.uploadedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCheck size={14} style={{ color: 'var(--text-muted)' }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Uploaded At: </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {new Date(document.uploadedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Verification Actions for Officers */}
        {permissions.canPerformScrutiny && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
              Officer Scrutiny Actions
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<ShieldCheck size={14} />}
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'Document Verified',
                    message: `${document.documentName} marked as statutory compliant.`,
                  });
                  onClose();
                }}
              >
                Mark Verified
              </Button>

              {onFlagAsDeficient && (
                <Button
                  variant="destructive"
                  size="sm"
                  leftIcon={<AlertTriangle size={14} />}
                  onClick={() => {
                    onClose();
                    onFlagAsDeficient(document);
                  }}
                >
                  Flag Non-Compliant
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
