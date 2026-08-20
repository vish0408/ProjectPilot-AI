import { useState, useEffect } from "react";
import { AlertCircle, Check, CheckCircle, Edit2, Key, Settings, Shield, X, Plus, Trash2 } from "lucide-react";
import StatCard from "../../components/cards/StatCard";
import Card from "../../components/common/Card";
import SectionHead from "../../components/common/SectionHead";
import Badge from "../../components/common/Badge";
import { adminService } from "../../services/AdminService";
import type { RoleResponse, PermissionResponse } from "../../types/Admin";

export default function AdminRolesPermissions() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [permissions, setPermissions] = useState<PermissionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        adminService.getRoles(),
        adminService.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Roles" value={`${roles.length}`} icon={Key} color="bg-blue-500"/>
        <StatCard label="Permissions" value={`${permissions.length}`} icon={Shield} color="bg-indigo-500"/>
        <StatCard label="Permission Groups" value={`${Object.keys(permGroups).length}`} icon={Settings} color="bg-green-500"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-4">
          <SectionHead title="Roles" desc="Manage system roles"
            action={
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
                  <button className="border border-border text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-lg hover:bg-muted flex items-center gap-1">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.permissionNames.slice(0, 8).map((p, j) => (
                  <Badge key={j} variant="outline">{p}</Badge>
                ))}
                {r.permissionNames.length > 8 && (
                  <Badge variant="info">+{r.permissionNames.length - 8} more</Badge>
                )}
              </div>
            </Card>
          ))}
          {!roles.length && <p className="text-sm text-muted-foreground text-center py-4">No roles found</p>}
        </div>
        <div className="flex flex-col gap-4">
          <SectionHead title="Permissions" desc="Available permission groups"
            action={
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Permission
              </button>
            }
          />
          {Object.entries(permGroups).map(([group, perms]) => (
            <Card key={group}>
              <SectionHead title={group} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {perms.map((p) => (
                  <Badge key={p.id} variant="outline">{p.name}</Badge>
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
