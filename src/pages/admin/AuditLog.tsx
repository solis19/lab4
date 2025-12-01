import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { AuditLog } from '../../types/database.types';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Input } from '../../components/ui/Input';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
      }

      const logsData = data || [];
      setLogs(logsData);

      // Cargar los display_name de los usuarios que aparecen en los logs
      const actorIds = Array.from(
        new Set(
          logsData
            .map((log) => log.actor_id)
            .filter((id): id is string => !!id)
        )
      );

      if (actorIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', actorIds);

        if (profilesError) {
          console.error('Error fetching profiles for audit logs:', profilesError);
        } else if (profiles) {
          const map: Record<string, string> = {};
          for (const profile of profiles) {
            if (profile.id) {
              map[profile.id] = profile.display_name || '';
            }
          }
          setUserNames(map);
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = filter.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.table_name || '').toLowerCase().includes(term) ||
      (userNames[log.actor_id || ''] || '').toLowerCase().includes(term)
    );
  });

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
          <h1 className="text-2xl font-semibold text-gray-900">Auditoría</h1>
          <p className="mt-2 text-sm text-gray-700">
            Registro de acciones del sistema (solo lectura)
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          label="Filtrar"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar por acción o tabla..."
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Acción</TableHeaderCell>
              <TableHeaderCell>Tabla</TableHeaderCell>
              <TableHeaderCell>ID Afectado</TableHeaderCell>
              <TableHeaderCell>Usuario</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No hay registros de auditoría
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.at
                      ? new Date(log.at).toLocaleString('es-ES')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                        log.action === 'create'
                          ? 'bg-green-100 text-green-800'
                          : log.action === 'update'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'delete'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.table_name || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.target_id ? log.target_id.substring(0, 8) + '...' : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.actor_id
                      ? userNames[log.actor_id] ||
                        `${log.actor_id.substring(0, 8)}...`
                      : 'Sistema'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

