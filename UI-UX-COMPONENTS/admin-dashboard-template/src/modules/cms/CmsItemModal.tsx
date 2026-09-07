import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { CmsItem, CmsCollection } from '../../types/cms';

interface CmsItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CmsCollection;
  item: CmsItem | null;
  onSave: (item: Omit<CmsItem, 'id' | 'updatedAt'> & { id?: string }) => void;
}

export const CmsItemModal: React.FC<CmsItemModalProps> = ({
  isOpen,
  onClose,
  collection,
  item,
  onSave
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(item?.title || '');
  const [status, setStatus] = useState<'draft' | 'published'>(item?.status || 'published');
  const [metadata, setMetadata] = useState<Record<string, unknown>>(item?.metadata || {});

  useEffect(() => {
    setTitle(item?.title || '');
    setStatus(item?.status || 'published');
    setMetadata(item?.metadata || {});
  }, [item]);

  const handleMetadataChange = (key: string, value: unknown) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: item?.id,
      collectionId: collection.id,
      order: item?.order ?? 0,
      title,
      status,
      metadata
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: 'var(--brand-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {collection.name}
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)' }}>
              {item ? `Edit ${collection.singularName}` : `New ${collection.singularName}`}
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div className="form-group">
            <label className="form-label">{collection.singularName} Title *</label>
            <input
              type="text"
              className="form-input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architectural Spatial Planning"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Publication Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setStatus('published')}
                className={`badge ${status === 'published' ? 'badge-live' : 'badge-neutral'}`}
                style={{ cursor: 'pointer' }}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                className={`badge ${status === 'draft' ? 'badge-risk' : 'badge-neutral'}`}
                style={{ cursor: 'pointer' }}
              >
                Draft
              </button>
            </div>
          </div>

          {/* Dynamic Collection Fields */}
          {collection.fields.map((f) => (
            <div key={f.key} className="form-group">
              <label className="form-label">
                {f.label} {f.required && '*'}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  className="form-input"
                  rows={3}
                  value={String(metadata[f.key] || '')}
                  onChange={(e) => handleMetadataChange(f.key, e.target.value)}
                />
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  className="form-input"
                  value={String(metadata[f.key] || '')}
                  onChange={(e) => handleMetadataChange(f.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <div
            style={{
              paddingTop: '14px',
              borderTop: '1px solid var(--color-hairline)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Check size={14} />
              <span>Save Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
