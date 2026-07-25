import { useState, useEffect } from "react";
import { Edit2, Key, Settings, Shield, Plus, X, Save, Trash2 } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { RoleResponse, PermissionResponse, CreateRoleRequest, UpdateRoleRequest, CreatePermissionRequest, UpdatePermissionRequest } from "../../types/Admin";

export default function AdminRolesPermissions() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role form state
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissionIds: [] as string[], isActive: true });

  // Permission form state
  const [showPermForm, setShowPermForm] = useState(false);
  const [editingPerm, setEditingPerm] = useState<PermissionResponse | null>(null);
  const [savingPerm, setSavingPerm] = useState(false);
  const [permForm, setPermForm] = useState({ name: "", description: "", group: "" });

  const fetchData = async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Role handlers
  const resetRoleForm = () => {
    setRoleForm({ name: "", description: "", permissionIds: [], isActive: true });
    setEditingRole(null);
    setShowRoleForm(false);
  };

  const openAddRole = () => {
    resetRoleForm();
    setShowRoleForm(true);
  };

  const openEditRole = (role: RoleResponse) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissionNames
        .map(pn => permissions.find(p => p.name === pn)?.id || "")
        .filter(Boolean),
      isActive: true,
    });
    setShowRoleForm(true);
  };

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) { setError("Role name is required"); return; }
    setSavingRole(true);
    try {
      if (editingRole) {
        const data: UpdateRoleRequest = {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissionIds: roleForm.permissionIds,
          isActive: roleForm.isActive,
        };
        await adminService.updateRole(editingRole.id, data);
      } else {
        const data: CreateRoleRequest = {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissionIds: roleForm.permissionIds,
        };
        await adminService.createRole(data);
      }
      resetRoleForm();
      fetchData();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSavingRole(false); }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    try { await adminService.deleteRole(id); fetchData(); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  // Permission handlers
  const resetPermForm = () => {
    setPermForm({ name: "", description: "", group: "" });
    setEditingPerm(null);
    setShowPermForm(false);
  };

  const openAddPerm = () => {
    resetPermForm();
    setShowPermForm(true);
  };

  const openEditPerm = (perm: PermissionResponse) => {
    setEditingPerm(perm);
    setPermForm({ name: perm.name, description: perm.description, group: perm.group });
    setShowPermForm(true);
  };

  const handleSavePerm = async () => {
    if (!permForm.name.trim() || !permForm.group.trim()) { setError("Name and group are required"); return; }
    setSavingPerm(true);
    try {
      if (editingPerm) {
        const data: UpdatePermissionRequest = {
          name: permForm.name.trim(),
          description: permForm.description.trim(),
          group: permForm.group.trim(),
        };
        await adminService.updatePermission(editingPerm.id, data);
      } else {
        const data: CreatePermissionRequest = {
          name: permForm.name.trim(),
          description: permForm.description.trim(),
          group: permForm.group.trim(),
        };
        await adminService.createPermission(data);
      }
      resetPermForm();
      fetchData();
    } catch (e) { if (e instanceof Error) setError(e.message); }
    finally { setSavingPerm(false); }
  };

  const handleDeletePerm = async (id: string) => {
    if (!confirm("Delete this permission?")) return;
    try { await adminService.deletePermission(id); fetchData(); }
    catch (e) { if (e instanceof Error) setError(e.message); }
  };

  const togglePermission = (id: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id)
        ? prev.permissionIds.filter(pid => pid !== id)
        : [...prev.permissionIds, id],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const permGroups = permissions.reduce<Record<string, PermissionResponse[]>>((acc, p) => {
    if (!acc[p.group]) acc[p.group] = [];
    acc[p.group].push(p);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 flex items-center justify-between">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          <button onClick={() => setError(null)}><X className="w-4 h-4 text-red-500" /></button>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Roles" value={`${roles.length}`} icon={Key} color="bg-blue-500"/>
        <StatCard label="Permissions" value={`${permissions.length}`} icon={Shield} color="bg-indigo-500"/>
        <StatCard label="Permission Groups" value={`${Object.keys(permGroups).length}`} icon={Settings} color="bg-green-500"/>
      </div>

      {/* Role Form */}
      {showRoleForm && (
        <Card>
          <SectionHead title={editingRole ? "Edit Role" : "Add Role"} action={
            <button onClick={resetRoleForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="flex flex-col gap-3 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Name *</label>
                <input value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} placeholder="Role name"
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
                <input value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Role description"
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-xl">
                {permissions.map(p => (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={roleForm.permissionIds.includes(p.id)} onChange={() => togglePermission(p.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs">{p.name}</span>
                  </label>
                ))}
                {!permissions.length && <p className="text-xs text-muted-foreground col-span-full text-center py-2">No permissions available</p>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveRole} disabled={savingRole}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingRole ? "Saving..." : editingRole ? "Update" : "Create"}
            </button>
            <button onClick={resetRoleForm} className="border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
          </div>
        </Card>
      )}

      {/* Permission Form */}
      {showPermForm && (
        <Card>
          <SectionHead title={editingPerm ? "Edit Permission" : "Add Permission"} action={
            <button onClick={resetPermForm} className="text-xs text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          } />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Name *</label>
              <input value={permForm.name} onChange={e => setPermForm({ ...permForm, name: e.target.value })} placeholder="e.g. users.create"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
              <input value={permForm.description} onChange={e => setPermForm({ ...permForm, description: e.target.value })} placeholder="Description"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Group *</label>
              <input value={permForm.group} onChange={e => setPermForm({ ...permForm, group: e.target.value })} placeholder="e.g. Users"
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSavePerm} disabled={savingPerm}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
              <Save className="w-4 h-4" /> {savingPerm ? "Saving..." : editingPerm ? "Update" : "Create"}
            </button>
            <button onClick={resetPermForm} className="border border-border text-sm font-medium px-4 py-2 rounded-xl hover:bg-muted">Cancel</button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <SectionHead title="Roles" desc="Manage system roles"
            action={
              <button onClick={openAddRole} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Role
              </button>
            }
          />
          {roles.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.userCount} users</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditRole(r)} className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-1">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => handleDeleteRole(r.id)} className="border border-border text-xs font-medium text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(r.permissionNames ?? []).slice(0, 8).map((p, j) => (
                  <Badge key={j} variant="outline">{p}</Badge>
                ))}
                {(r.permissionNames ?? []).length > 8 && (
                  <Badge variant="info">+{(r.permissionNames ?? []).length - 8} more</Badge>
                )}
              </div>
            </Card>
          ))}
          {!roles.length && <p className="text-sm text-muted-foreground text-center py-4">No roles found</p>}
        </div>
        <div className="flex flex-col gap-4">
          <SectionHead title="Permissions" desc="Available permission groups"
            action={
              <button onClick={openAddPerm} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Permission
              </button>
            }
          />
          {Object.entries(permGroups).map(([group, perms]) => (
            <Card key={group}>
              <SectionHead title={group} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {perms.map((p) => (
                  <div key={p.id} className="flex items-center gap-1">
                    <Badge variant="outline">{p.name}</Badge>
                    <button onClick={() => openEditPerm(p)} className="p-0.5 text-muted-foreground hover:text-blue-600" title="Edit">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeletePerm(p.id)} className="p-0.5 text-muted-foreground hover:text-red-600" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {!Object.keys(permGroups).length && <p className="text-sm text-muted-foreground text-center py-4">No permissions found</p>}
        </div>
      </div>
    </div>
  );
}
