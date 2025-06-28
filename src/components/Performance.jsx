import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Target, Award, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const Performance = () => {
  const [performance, setPerformance] = useState([])
  const [overallPerformance, setOverallPerformance] = useState({
    total_correct: 0,
    total_answers: 0,
    overall_accuracy: 0,
    subjects_count: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchPerformance()
    fetchOverallPerformance()
  }, [])

  const fetchPerformance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/performance')
      const data = await response.json()
      setPerformance(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar desempenho",
        variant: "destructive"
      })
    }
  }

  const fetchOverallPerformance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/performance/overall')
      const data = await response.json()
      setOverallPerformance(data)
    } catch (error) {
      console.error('Erro ao carregar desempenho geral:', error)
    }
  }

  const handleResetPerformance = async () => {
    if (!confirm('Tem certeza que deseja resetar todas as estatísticas de desempenho?')) return

    try {
      const response = await fetch('http://localhost:5000/api/performance/reset', {
        method: 'POST',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Estatísticas resetadas com sucesso!"
        })
        fetchPerformance()
        fetchOverallPerformance()
      } else {
        throw new Error('Erro ao resetar estatísticas')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar estatísticas",
        variant: "destructive"
      })
    }
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-600'
    if (accuracy >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBadgeColor = (accuracy) => {
    if (accuracy >= 80) return 'bg-green-100 text-green-800'
    if (accuracy >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  // Dados para o gráfico de barras
  const chartData = performance.map(p => ({
    subject: p.subject_name.length > 15 ? p.subject_name.substring(0, 15) + '...' : p.subject_name,
    accuracy: p.accuracy,
    correct: p.correct_answers,
    total: p.total_answers
  }))

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Corretas', value: overallPerformance.total_correct, color: '#10b981' },
    { name: 'Incorretas', value: overallPerformance.total_answers - overallPerformance.total_correct, color: '#ef4444' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Análise de Desempenho</h1>
          <p className="text-gray-600">Acompanhe seu progresso e estatísticas por assunto</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleResetPerformance}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Resetar Estatísticas</span>
        </Button>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallPerformance.total_answers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas Corretas</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallPerformance.total_correct}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(overallPerformance.overall_accuracy)}`}>
              {overallPerformance.overall_accuracy.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assuntos Estudados</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overallPerformance.subjects_count}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      {performance.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Assunto</CardTitle>
              <CardDescription>Taxa de acerto em cada assunto estudado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="subject" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'accuracy' ? `${value.toFixed(1)}%` : value,
                      name === 'accuracy' ? 'Taxa de Acerto' : name
                    ]}
                    labelFormatter={(label) => `Assunto: ${label}`}
                  />
                  <Bar dataKey="accuracy" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geral</CardTitle>
              <CardDescription>Proporção de respostas corretas e incorretas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Desempenho Detalhado por Assunto */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho Detalhado por Assunto</CardTitle>
          <CardDescription>Estatísticas completas de cada assunto estudado</CardDescription>
        </CardHeader>
        <CardContent>
          {performance.length > 0 ? (
            <div className="space-y-4">
              {performance.map((subject) => (
                <div key={subject.subject_id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                    <Badge className={getAccuracyBadgeColor(subject.accuracy)}>
                      {subject.accuracy.toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Total:</span> {subject.total_answers} questões
                    </div>
                    <div>
                      <span className="font-medium">Corretas:</span> {subject.correct_answers}
                    </div>
                    <div>
                      <span className="font-medium">Incorretas:</span> {subject.total_answers - subject.correct_answers}
                    </div>
                  </div>
                  
                  <Progress value={subject.accuracy} className="w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum dado de desempenho disponível</p>
              <p className="text-sm text-gray-400 mt-1">Complete alguns simulados para ver suas estatísticas!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Performance

