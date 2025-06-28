import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, FileText, BarChart3, Plus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    totalSubjects: 0,
    overallAccuracy: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch questions count
      const questionsRes = await fetch('http://localhost:5000/api/questions')
      const questions = await questionsRes.json()
      
      // Fetch exams count
      const examsRes = await fetch('http://localhost:5000/api/exams')
      const exams = await examsRes.json()
      
      // Fetch subjects count
      const subjectsRes = await fetch('http://localhost:5000/api/subjects')
      const subjects = await subjectsRes.json()
      
      // Fetch overall performance
      const performanceRes = await fetch('http://localhost:5000/api/performance/overall')
      const performance = await performanceRes.json()

      setStats({
        totalQuestions: questions.length,
        totalExams: exams.length,
        totalSubjects: subjects.length,
        overallAccuracy: performance.overall_accuracy || 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const statCards = [
    {
      title: 'Total de Questões',
      value: stats.totalQuestions,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Simulados Realizados',
      value: stats.totalExams,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Assuntos Cadastrados',
      value: stats.totalSubjects,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Taxa de Acerto Geral',
      value: `${stats.overallAccuracy.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Bem-vindo ao Banco de Questões
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gerencie suas questões, crie simulados personalizados e acompanhe seu desempenho de forma prática e eficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <span>Adicionar Questões</span>
            </CardTitle>
            <CardDescription>
              Cadastre novas questões no seu banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/questions">
              <Button className="w-full">
                Gerenciar Questões
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span>Criar Simulado</span>
            </CardTitle>
            <CardDescription>
              Monte simulados personalizados com filtros avançados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/exams">
              <Button className="w-full" variant="outline">
                Criar Simulado
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Ver Desempenho</span>
            </CardTitle>
            <CardDescription>
              Acompanhe suas estatísticas por assunto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/performance">
              <Button className="w-full" variant="outline">
                Ver Relatórios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

