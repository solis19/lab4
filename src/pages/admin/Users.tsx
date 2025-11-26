import { useEffect, useState } from 'react';
import { UserRole } from '../../types/database.types';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { userService, UserWithRole } from '../../services';

export const Users = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    phone: '',
    genero: '',
    fecha_nacimiento: '',
    role: '' as UserRole | '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserWithRole) => {
    setEditingUser(user);
    setFormData({
      display_name: user.display_name || '',
      phone: user.phone || '',
      genero: user.genero || '',
      fecha_nacimiento: user.fecha_nacimiento || '',
      role: user.user_role || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await userService.updateUser(
        editingUser.id,
        {
          display_name: formData.display_name || null,
          phone: formData.phone || null,
          genero: formData.genero || null,
          fecha_nacimiento: formData.fecha_nacimiento || null,
        },
        formData.role
      );

      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar el usuario');
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
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra los perfiles de los usuarios del sistema
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Nombre</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Rol</TableHeaderCell>
              <TableHeaderCell>Teléfono</TableHeaderCell>
              <TableHeaderCell>Género</TableHeaderCell>
              <TableHeaderCell>Fecha de Nacimiento</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.display_name || '-'}</TableCell>
                <TableCell className="font-mono text-sm">{user.email || 'Sin email'}</TableCell>
                <TableCell>
                  {user.user_role ? (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.user_role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {user.user_role === 'admin' ? 'Administrador' : 'Creador'}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Sin rol</span>
                  )}
                </TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.genero || '-'}</TableCell>
                <TableCell>
                  {user.fecha_nacimiento
                    ? new Date(user.fecha_nacimiento).toLocaleDateString('es-ES')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                    Editar
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
          setEditingUser(null);
        }}
        title="Editar Usuario"
        size="md"
      >
        <div className="space-y-4">
          {editingUser && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Email:</span> {editingUser.email || 'Sin email'}
              </p>
            </div>
          )}

          <Input
            label="Nombre completo"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol del Sistema
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole | '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin rol asignado</option>
              <option value="creator">Creador</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Los administradores tienen acceso completo al sistema
            </p>
          </div>

          <Input
            label="Teléfono"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={formData.genero}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          <Input
            label="Fecha de Nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
          />
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave}>Guardar Cambios</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

