import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Layers 
} from 'lucide-react';
import { IAdminStorageAdapter } from '../../types/adapter';
import { CmsCollection, CmsItem } from '../../types/cms';
import { CmsItemModal } from './CmsItemModal';
import { EmptyState } from '../../layout/EmptyState';
import { SpatialContainer } from '../../layout/SpatialContainer';

interface CmsModuleProps {
  adapter: IAdminStorageAdapter;
  globalSearchQuery: string;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const CmsModule: React.FC<CmsModuleProps> = ({ adapter, globalSearchQuery, onShowToast }) => {
  const [collections, setCollections] = useState<CmsCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('');
  const [items, setItems] = useState<CmsItem[]>([]);
  const [editingItem, setEditingItem] = useState<CmsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load collections
  useEffect(() => {
    const init = async () => {
      const colls = await adapter.getCollections();
      setCollections(colls);
      if (colls.length > 0 && !activeCollectionId) {
        setActiveCollectionId(colls[0].id);
      }
    };
    init();
  }, [adapter]);

  // Load items when active collection changes
  const loadItems = async () => {
    if (!activeCollectionId) return;
    const data = await adapter.getItems(activeCollectionId);
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, [activeCollectionId, adapter]);

  const activeCollection = collections.find(c => c.id === activeCollectionId);

  const filteredItems = items.filter(item => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || 
      Object.values(item.metadata).some(val => String(val).toLowerCase().includes(q));
  });

  const handleMove = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Apply renumber order invariant
    const reorderedIds = newItems.map(i => i.id);
    await adapter.reorderItems(activeCollectionId, reorderedIds);
    setItems(newItems.map((item, idx) => ({ ...item, order: idx })));
    onShowToast('Display order updated', 'info');
  };

  const handleSaveItem = async (itemData: Omit<CmsItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const saved = await adapter.saveItem(itemData);
    await loadItems();
    onShowToast(`Saved "${saved.title}"`, 'success');
  };

  const handleDeleteItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (window.confirm('Delete this item from the collection?')) {
      await adapter.deleteItem(activeCollectionId, itemId);
      await loadItems();
      onShowToast(`Deleted "${item?.title || 'item'}"`, 'info');
    }
  };

  const handleToggleStatus = async (item: CmsItem) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    await adapter.saveItem({ ...item, status: newStatus });
    await loadItems();
    onShowToast(`Status set to ${newStatus}`, 'info');
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Collection Tab Selector (Segmented Pill Array) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {collections.map((coll) => (
          <button
            key={coll.id}
            onClick={() => setActiveCollectionId(coll.id)}
            className={coll.id === activeCollectionId ? 'btn-primary' : 'btn-secondary'}
            style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px' }}
          >
            {coll.name}
          </button>
        ))}
      </div>

      {/* Main CMS Container */}
      <SpatialContainer
        title={activeCollection?.name || 'Content Collection'}
        badge={`${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`}
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={14} />
            <span>Add {activeCollection?.singularName || 'Item'}</span>
          </button>
        }
      >
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={`No ${activeCollection?.name || 'Content'} Configured`}
            description={activeCollection?.description || 'Add structured content items that display publicly on your site.'}
            actionLabel={`Create First ${activeCollection?.singularName || 'Item'}`}
            onAction={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Order</th>
                  <th>Title & Slug</th>
                  <th>Metadata Summary</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMove(index, -1)}
                          className="btn-ghost"
                          style={{ padding: '2px', opacity: index === 0 ? 0.25 : 1 }}
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={index === filteredItems.length - 1}
                          onClick={() => handleMove(index, 1)}
                          className="btn-ghost"
                          style={{ padding: '2px', opacity: index === filteredItems.length - 1 ? 0.25 : 1 }}
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        /{item.slug}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--brand-text-secondary)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {Object.entries(item.metadata).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`badge ${item.status === 'published' ? 'badge-live' : 'badge-risk'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {item.status}
                      </button>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          className="btn-ghost"
                          title="Edit item"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="btn-ghost"
                          style={{ color: 'var(--signal-danger)' }}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>

      {/* Item Modal */}
      {activeCollection && (
        <CmsItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          collection={activeCollection}
          item={editingItem}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};
