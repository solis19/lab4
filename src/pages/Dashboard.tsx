import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Survey } from '../types/database.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { surveyService } from '../services';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [timelineData, setTimelineData] = useState<Array<{ date: string; respuestas: number }>>([]);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    draftSurveys: 0,
    closedSurveys: 0,
    averageResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Obtener encuestas del usuario
      const allSurveys = await surveyService.getUserSurveys(user.id);
      setSurveys(allSurveys.slice(0, 10));

      // Obtener estadísticas básicas
      const statsData = await surveyService.getUserSurveyStats(user.id);
      
      // Obtener datos de timeline
      const timeline = await surveyService.getResponsesTimeline(user.id);
      setTimelineData(timeline);
      
      // Calcular estadísticas adicionales
      const draftCount = allSurveys.filter(s => s.status === 'draft').length;
      const closedCount = allSurveys.filter(s => s.status === 'closed').length;
      const avgResponses = statsData.totalSurveys > 0 
        ? Math.round(statsData.totalResponses / statsData.totalSurveys) 
        : 0;

      setStats({
        ...statsData,
        draftSurveys: draftCount,
        closedSurveys: closedCount,
        averageResponses: avgResponses,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="relative min-h-screen">
      {/* Blob shapes decorativos de fondo expandido a toda la pantalla */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 -left-48 w-[550px] h-[550px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-[450px] h-[450px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-0 relative z-10">
        <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700">
            Resumen de tus encuestas y respuestas
          </p>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => navigate('/surveys/new')} className="w-full sm:w-auto text-sm">
            Crear Nuevo Formulario
          </Button>
        </div>
      </div>

      {/* KPIs Mejorados */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total de Formularios */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-xl">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-100 uppercase tracking-wide">
                  Total Formularios
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                  {stats.totalSurveys}
                </p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Total de Respuestas */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-xl">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-100 uppercase tracking-wide">
                  Total Respuestas
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                  {stats.totalResponses}
                </p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Formularios Activos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-xl">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-100 uppercase tracking-wide">
                  Activos
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                  {stats.activeSurveys}
                </p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Promedio de Respuestas */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 overflow-hidden shadow-lg rounded-xl">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-orange-100 uppercase tracking-wide">
                  Promedio
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                  {stats.averageResponses}
                </p>
                <p className="text-xs text-orange-100 mt-1">respuestas/formulario</p>
              </div>
              <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Secundarias */}
      <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Borradores */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-yellow-400">
          <div className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Borradores</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{stats.draftSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cerrados */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-gray-400">
          <div className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-md p-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Cerrados</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">{stats.closedSurveys}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tasa de Actividad */}
        <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-indigo-400 col-span-2 lg:col-span-1">
          <div className="p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Tasa Activos</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  {stats.totalSurveys > 0 ? Math.round((stats.activeSurveys / stats.totalSurveys) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolución de Respuestas */}
      <div className="mt-6 sm:mt-8">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
            Actividad de Respuestas (Últimos 7 días)
          </h2>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  style={{ fontSize: '12px' }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 600 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="respuestas" 
                  stroke="#667eea" 
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="mt-6 sm:mt-8 mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Actividad Reciente</h2>
        
        {surveys.length === 0 ? (
          <div className="bg-white shadow rounded-lg text-center py-8 sm:py-12 px-4">
            <p className="text-sm sm:text-base text-gray-500">No hay encuestas aún</p>
            <Button
              className="mt-4 w-full sm:w-auto"
              onClick={() => navigate('/surveys/new')}
            >
              Crear tu primera encuesta
            </Button>
          </div>
        ) : (
          <>
            {/* Vista de tarjetas para móvil */}
            <div className="sm:hidden space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm text-gray-900 flex-1 break-words pr-2">
                      {survey.title}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        survey.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : survey.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {survey.status === 'published'
                        ? 'Publicado'
                        : survey.status === 'draft'
                        ? 'Borrador'
                        : 'Cerrado'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Actualizado: {survey.updated_at
                      ? new Date(survey.updated_at).toLocaleDateString('es-ES')
                      : '-'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/surveys/${survey.id}`)}
                    className="w-full text-xs"
                  >
                    Ver detalles
                  </Button>
                </div>
              ))}
            </div>

            {/* Vista de tabla para desktop */}
            <div className="hidden sm:block bg-white shadow overflow-hidden rounded-md">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Título</TableHeaderCell>
                    <TableHeaderCell>Estado</TableHeaderCell>
                    <TableHeaderCell>Última actualización</TableHeaderCell>
                    <TableHeaderCell>Acciones</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">{survey.title}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            survey.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : survey.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {survey.status === 'published'
                            ? 'Publicado'
                            : survey.status === 'draft'
                            ? 'Borrador'
                            : 'Cerrado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {survey.updated_at
                          ? new Date(survey.updated_at).toLocaleDateString('es-ES')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/surveys/${survey.id}`)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

