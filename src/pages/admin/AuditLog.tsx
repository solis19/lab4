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

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.table_name.toLowerCase().includes(filter.toLowerCase())
  );

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
              <TableHeaderCell>ID de Registro</TableHeaderCell>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Detalles</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No hay registros de auditoría
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString('es-ES')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.action === 'create'
                          ? 'bg-green-100 text-green-800'
                          : log.action === 'update'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'publish'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.table_name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.record_id ? log.record_id.substring(0, 8) + '...' : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.user_id ? log.user_id.substring(0, 8) + '...' : 'Sistema'}
                  </TableCell>
                  <TableCell>
                    {log.details ? (
                      <details>
                        <summary className="cursor-pointer text-sm text-blue-600">
                          Ver detalles
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '-'
                    )}
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

