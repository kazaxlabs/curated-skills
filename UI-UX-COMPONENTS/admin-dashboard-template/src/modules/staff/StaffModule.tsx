import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  UserPlus 
} from 'lucide-react';
import { IAdminStorageAdapter } from '../../types/adapter';
import { StaffUser, StaffRole, PermissionSet } from '../../types/staff';
import { InviteStaffModal } from './InviteStaffModal';
import { EmptyState } from '../../layout/EmptyState';
import { SpatialContainer } from '../../layout/SpatialContainer';

interface StaffModuleProps {
  adapter: IAdminStorageAdapter;
  globalSearchQuery: string;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const StaffModule: React.FC<StaffModuleProps> = ({ adapter, globalSearchQuery, onShowToast }) => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const loadData = async () => {
    const users = await adapter.getStaffUsers();
    setStaffList(users);
  };

  useEffect(() => {
    loadData();
  }, [adapter]);

  const handleTogglePermission = async (userId: string, permKey: keyof PermissionSet) => {
    const user = staffList.find(u => u.id === userId);
    if (!user || user.role === 'owner') return;

    const updatedPermissions = {
      ...user.permissions,
      [permKey]: !user.permissions[permKey]
    };

    const updated = await adapter.updateStaffPermissions(userId, updatedPermissions);
    setStaffList(prev => prev.map(u => u.id === userId ? updated : u));
    onShowToast(`Updated ${permKey} for ${user.name}`, 'info');
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const user = staffList.find(u => u.id === userId);
    const updated = await adapter.toggleStaffStatus(userId, !currentStatus);
    setStaffList(prev => prev.map(u => u.id === userId ? updated : u));
    onShowToast(`${user?.name || 'User'} is now ${!currentStatus ? 'Active' : 'Disabled'}`, 'info');
  };

  const handleInvite = async (
    email: string,
    name: string,
    role: StaffRole,
    permissions: PermissionSet
  ) => {
    const newUser = await adapter.inviteStaff(email, name, role, permissions);
    setStaffList(prev => [...prev, newUser]);
    onShowToast(`Invitation dispatched to ${email}`, 'success');
  };

  const filteredStaff = staffList.filter(u => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  const getRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'owner': return <span className="badge badge-danger">Owner</span>;
      case 'manager': return <span className="badge badge-risk">Manager</span>;
      case 'editor': return <span className="badge badge-info">Editor</span>;
      case 'viewer': return <span className="badge badge-neutral">Viewer</span>;
    }
  };

  return (
    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <SpatialContainer
        title="Administrative Staff & Role-Based Access Control (RBAC)"
        badge={`${filteredStaff.length} active member${filteredStaff.length === 1 ? '' : 's'}`}
        actions={
          <button onClick={() => setIsInviteOpen(true)} className="btn-primary" style={{ fontSize: '12px' }}>
            <UserPlus size={14} />
            <span>Invite Member</span>
          </button>
        }
      >
        {filteredStaff.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Staff Accounts Found"
            description="Manage administrative permissions, invite colleagues, and enforce strict role boundaries."
            actionLabel="Invite Administrator"
            onAction={() => setIsInviteOpen(true)}
            actionIcon={UserPlus}
          />
        ) : (
          <div className="data-table-container" style={{ border: 'none', borderRadius: '0' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Can Manage CRM</th>
                  <th>Can Send Emails</th>
                  <th>Can Export Data</th>
                  <th>Can Edit CMS</th>
                  <th>Can Security/Audit</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((u) => {
                  const isOwner = u.role === 'owner';
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--color-ink)',
                              color: 'var(--surface-card)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>
                        <button
                          type="button"
                          disabled={isOwner}
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`badge ${u.isActive ? 'badge-live' : 'badge-neutral'}`}
                          style={{ cursor: isOwner ? 'default' : 'pointer' }}
                        >
                          {u.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isOwner || u.permissions.canManageLeads}
                          disabled={isOwner}
                          onChange={() => handleTogglePermission(u.id, 'canManageLeads')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isOwner || u.permissions.canSendEmails}
                          disabled={isOwner}
                          onChange={() => handleTogglePermission(u.id, 'canSendEmails')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isOwner || u.permissions.canExportData}
                          disabled={isOwner}
                          onChange={() => handleTogglePermission(u.id, 'canExportData')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isOwner || u.permissions.canEditCMS}
                          disabled={isOwner}
                          onChange={() => handleTogglePermission(u.id, 'canEditCMS')}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={isOwner || u.permissions.canManageSecurity}
                          disabled={isOwner}
                          onChange={() => handleTogglePermission(u.id, 'canManageSecurity')}
                        />
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--brand-text-muted)' }}>
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : 'Never logged in'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SpatialContainer>

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};
