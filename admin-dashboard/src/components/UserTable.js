import React, { useState } from 'react';
import { userService } from '../services/api';
import '../styles/UserTable.css';

const UserTable = ({ users, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (user) => {
    setEditingId(user._id);
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  };

  const handleSave = async (userId) => {
    try {
      await userService.updateUser(userId, editData.name, editData.email, editData.phone);
      alert('User updated successfully');
      setEditingId(null);
      onUpdate();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        alert('User deleted successfully');
        onUpdate();
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await userService.updateUserRole(userId, newRole);
      alert(`User role changed to ${newRole}`);
      onUpdate();
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      alert('User status updated');
      onUpdate();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th>User Info</th>
            <th className="hide-sm">Email</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
            <th className="hide-sm">Member Since</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="user-cell">
                <span className="avatar-chip">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <div>
                  {editingId === user._id ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    />
                  ) : (
                    <strong>{user.name}</strong>
                  )}
                  <small>{user.email}</small>
                </div>
              </td>
              <td className="hide-sm">
                {editingId === user._id ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                ) : (
                  user.email
                )}
              </td>
              <td>
                {editingId === user._id ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                ) : (
                  user.phone
                )}
              </td>
              <td>
                <span className={`badge role-${user.role}`}>{user.role}</span>
              </td>
              <td>
                <span className={`badge status-${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="hide-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="actions">
                {editingId === user._id ? (
                  <>
                    <button
                      onClick={() => handleSave(user._id)}
                      className="btn-save"
                      title="Save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-cancel"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-edit"
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleToggleRole(user._id, user.role)}
                      className="btn-role"
                      title={`Change to ${user.role === 'admin' ? 'user' : 'admin'}`}
                    >
                      👤
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className="btn-status"
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? '🔒' : '🔓'}
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
