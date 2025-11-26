import { useEffect, useState } from 'react';
import { UserRole } from '../../types/database.types';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { roleService, UserRoleRecord, UserOption } from '../../services';

export const Roles = () => {
  const [roles, setRoles] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [formData, setFormData] = useState({
    user_id: '',
    role: 'creator' as UserRole,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const rolesData = await roleService.getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersData = await roleService.getUsersForRoleAssignment();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssign = async () => {
    try {
      await roleService.assignRole(formData.user_id, formData.role);
      setIsModalOpen(false);
      setFormData({ user_id: '', role: 'creator' });
      setSearchEmail('');
      fetchRoles();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      alert(error.message || 'Error al asignar el rol');
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar este rol?')) return;

    try {
      await roleService.revokeRole(userId);
      fetchRoles();
    } catch (error) {
      console.error('Error revoking role:', error);
      alert('Error al revocar el rol');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Roles</h1>
          <p className="mt-2 text-sm text-gray-700">
            Asigna o revoca roles de administrador y creador
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => setIsModalOpen(true)}>Asignar Rol</Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.user_id}>
                <TableCell>{role.profile?.display_name || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{role.email || 'Sin email'}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      role.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {role.role === 'admin' ? 'Administrador' : 'Creador'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRevoke(role.user_id)}
                  >
                    Revocar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({ user_id: '', role: 'creator' });
          setSearchEmail('');
        }}
        title="Asignar Rol"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar Usuario por Email
            </label>
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Escribe para buscar..."
              onFocus={() => {
                if (users.length === 0) fetchUsers();
              }}
            />
          </div>

          {searchEmail && (
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
              {loadingUsers ? (
                <div className="p-4 text-center text-gray-500">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                users
                  .filter((user) => 
                    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
                    user.display_name?.toLowerCase().includes(searchEmail.toLowerCase())
                  )
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setFormData({ ...formData, user_id: user.id });
                        setSearchEmail(user.email);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium text-sm">{user.email}</div>
                      {user.display_name && (
                        <div className="text-xs text-gray-500">{user.display_name}</div>
                      )}
                    </button>
                  ))
              )}
            </div>
          )}

          {formData.user_id && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Usuario seleccionado: <span className="font-medium">{searchEmail}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="creator">Creador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({ user_id: '', role: 'creator' });
                setSearchEmail('');
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!formData.user_id}
            >
              Asignar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

