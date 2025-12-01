import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Survey } from '../types/database.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { surveyService } from '../services';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
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
      // Obtener encuestas del usuario (limitadas a 10)
      const allSurveys = await surveyService.getUserSurveys(user.id);
      setSurveys(allSurveys.slice(0, 10));

      // Obtener estadísticas
      const statsData = await surveyService.getUserSurveyStats(user.id);
      setStats(statsData);
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
    <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-0 relative">
      {/* Blob shapes decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="sm:flex sm:items-center relative z-10">
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

      {/* KPIs */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalSurveys}</div>
              </div>
              <div className="ml-4 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Total de Formularios
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalResponses}</div>
              </div>
              <div className="ml-4 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Total de Respuestas
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-4 sm:p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeSurveys}</div>
              </div>
              <div className="ml-4 sm:ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                    Formularios Activos
                  </dt>
                </dl>
              </div>
            </div>
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
  );
};

