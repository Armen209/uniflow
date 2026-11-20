
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  type AdminUser,
} from "@/features/admin/api/admin";

type RoleFilter = "all" | "student" | "professor" | "admin";

type UserRole = "student" | "professor" | "admin";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Create user state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [editUserData, setEditUserData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
  });

  // Load users
  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Search and role filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Create user
  async function handleCreateUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setCreating(true);
      setCreateError(null);

      const createdUser = await createAdminUser(newUser);

      setUsers((current) => [createdUser, ...current]);

      setNewUser({
        full_name: "",
        email: "",
        password: "",
        role: "student",
      });

      setShowCreateForm(false);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create user."
      );
    } finally {
      setCreating(false);
    }
  }

  // Open edit form
  function openEditForm(user: AdminUser) {
    setShowCreateForm(false);
    setCreateError(null);

    setEditingUser(user);
    setEditError(null);

    setEditUserData({
      full_name: user.full_name,
      email: user.email,
      password: "",
      role: user.role,
    });
  }

  // Update user
  async function handleUpdateUser(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingUser) return;

    try {
      setUpdating(true);
      setEditError(null);

      const updatedUser = await updateAdminUser(editingUser.id, {
        full_name: editUserData.full_name,
        email: editUserData.email,
        role: editUserData.role,
        ...(editUserData.password
          ? { password: editUserData.password }
          : {}),
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === updatedUser.id ? updatedUser : user
        )
      );

      setEditingUser(null);

      setEditUserData({
        full_name: "",
        email: "",
        password: "",
        role: "student",
      });
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update user."
      );
    } finally {
      setUpdating(false);
    }
  }

  // Delete user
  async function handleDelete(user: AdminUser) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.full_name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);

      await deleteAdminUser(user.id);

      setUsers((current) =>
        current.filter((item) => item.id !== user.id)
      );

      if (editingUser?.id === user.id) {
        setEditingUser(null);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Loading state
  if (loading) {
    return <p className="text-muted">Loading users...</p>;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-red-600">{error}</p>

        <button
          onClick={loadUsers}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Users Management
          </h1>

          <p className="mt-2 text-muted">
            Manage students, professors and administrators.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setEditError(null);
            setCreateError(null);
            setShowCreateForm(true);
          }}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          + Create User
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Create New User
            </h2>

            <p className="mt-1 text-sm text-muted">
              Enter the details of the new university account.
            </p>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={newUser.full_name}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      full_name: event.target.value,
                    })
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      email: event.target.value,
                    })
                  }
                  placeholder="Enter email address"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Password
                </label>

                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      password: event.target.value,
                    })
                  }
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Role
                </label>

                <select
                  value={newUser.role}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      role: event.target.value as UserRole,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Save User"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError(null);
                }}
                disabled={creating}
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {editingUser && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Edit User
            </h2>

            <p className="mt-1 text-sm text-muted">
              Update the account information for {editingUser.full_name}.
            </p>
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={150}
                  value={editUserData.full_name}
                  onChange={(event) =>
                    setEditUserData({
                      ...editUserData,
                      full_name: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={editUserData.email}
                  onChange={(event) =>
                    setEditUserData({
                      ...editUserData,
                      email: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Password
                </label>

                <input
                  type="password"
                  minLength={8}
                  maxLength={72}
                  value={editUserData.password}
                  onChange={(event) =>
                    setEditUserData({
                      ...editUserData,
                      password: event.target.value,
                    })
                  }
                  placeholder="Leave empty to keep current password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Role
                </label>

                <select
                  value={editUserData.role}
                  onChange={(event) =>
                    setEditUserData({
                      ...editUserData,
                      role: event.target.value as UserRole,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                >
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {editError && (
              <p className="text-sm text-red-600">{editError}</p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setEditingUser(null);
                  setEditError(null);
                }}
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Students",
            value: users.filter((u) => u.role === "student").length,
          },
          {
            label: "Professors",
            value: users.filter((u) => u.role === "professor").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-sm text-muted">{stat.label}</p>

            <p className="mt-2 text-3xl font-bold text-foreground">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(event.target.value as RoleFilter)
          }
          className="rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">All roles</option>
          <option value="student">Students</option>
          <option value="professor">Professors</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-foreground">All Users</h2>

          <span className="text-sm text-muted">
            {filteredUsers.length} users
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-muted">
                <tr>
                  <th className="px-5 py-4 font-medium">Name</th>
                  <th className="px-5 py-4 font-medium">Email</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-border"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                      {user.full_name}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium capitalize text-primary">
                        {user.role}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditForm(user)}
                          className="text-sm font-medium text-primary hover:opacity-70"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === user.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
