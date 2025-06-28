import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { Plus, Play, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const API_BASE = 'https://weltoncardoso.pythonanywhere.com'

const Exams = () => {
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false)
  const [currentExam, setCurrentExam] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [examConfig, setExamConfig] = useState({
    name: '',
    quantity: 10,
    subject_ids: [],
    difficulty: '',
    only_new: false
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchExams()
    fetchSubjects()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/exams`)
      const data = await response.json()
      setExams(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar simulados",
        variant: "destructive"
      })
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/subjects`)
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Erro ao carregar assuntos:', error)
    }
  }

  const handleCreateExam = async (e) => {
    e.preventDefault()
    
    try {
      // Primeiro, gerar as questões
      const questionsResponse = await fetch(`${API_BASE}/api/questions/generate-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: examConfig.quantity,
          subject_ids: examConfig.subject_ids.length > 0 ? examConfig.subject_ids : undefined,
          difficulty: examConfig.difficulty || undefined,
          only_new: examConfig.only_new
        }),
      })

      if (!questionsResponse.ok) {
        const error = await questionsResponse.json()
        throw new Error(error.error || 'Erro ao gerar questões')
      }

      const questions = await questionsResponse.json()
      const questionIds = questions.map(q => q.id)

      // Criar o simulado
      const examResponse = await fetch(`${API_BASE}/api/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: examConfig.name,
          question_ids: questionIds
        }),
      })

      if (examResponse.ok) {
        toast({
          title: "Sucesso",
          description: "Simulado criado com sucesso!"
        })
        setIsCreateDialogOpen(false)
        setExamConfig({
          name: '',
          quantity: 10,
          subject_ids: [],
          difficulty: '',
          only_new: false
        })
        fetchExams()
      } else {
        throw new Error('Erro ao criar simulado')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const handleStartExam = async (examId) => {
    try {
      const response = await fetch(`${API_BASE}/api/exams/${examId}`)
      const exam = await response.json()
      
      setCurrentExam(exam)
      setCurrentQuestionIndex(0)
      setUserAnswers({})
      setIsExamDialogOpen(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar simulado",
        variant: "destructive"
      })
    }
  }

  const handleAnswerQuestion = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentExam.questions[currentQuestionIndex].id]: answer
    })
  }

  const handleNextQuestion = async () => {
    const currentQuestion = currentExam.questions[currentQuestionIndex]
    const userAnswer = userAnswers[currentQuestion.id]

    if (userAnswer) {
      // Submeter resposta
      try {
        await fetch(`${API_BASE}/api/exams/${currentExam.id}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question_id: currentQuestion.id,
            user_answer: userAnswer
          }),
        })
      } catch (error) {
        console.error('Erro ao submeter resposta:', error)
      }
    }

    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Finalizar simulado
      setIsExamDialogOpen(false)
      toast({
        title: "Simulado Concluído",
        description: "Suas respostas foram registradas!"
      })
      fetchExams()
    }
  }

  const handleDeleteExam = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este simulado?')) return

    try {
      const response = await fetch(`${API_BASE}/api/exams/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Simulado excluído com sucesso!"
        })
        fetchExams()
      } else {
        throw new Error('Erro ao excluir simulado')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir simulado",
        variant: "destructive"
      })
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Simulados</h1>
          <p className="text-gray-600">Crie e realize simulados personalizados</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Novo Simulado</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Simulado</DialogTitle>
              <DialogDescription>
                Configure seu simulado personalizado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Simulado</Label>
                <Input
                  id="name"
                  value={examConfig.name}
                  onChange={(e) => setExamConfig({...examConfig, name: e.target.value})}
                  placeholder="Ex: Simulado de Matemática"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantidade de Questões</Label>
                <Select value={examConfig.quantity.toString()} onValueChange={(value) => setExamConfig({...examConfig, quantity: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 questões</SelectItem>
                    <SelectItem value="10">10 questões</SelectItem>
                    <SelectItem value="15">15 questões</SelectItem>
                    <SelectItem value="20">20 questões</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade (Opcional)</Label>
                <Select value={examConfig.difficulty} onValueChange={(value) => setExamConfig({...examConfig, difficulty: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as dificuldades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as dificuldades</SelectItem>
                    <SelectItem value="Easy">Fácil</SelectItem>
                    <SelectItem value="Medium">Médio</SelectItem>
                    <SelectItem value="Hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="only_new"
                  checked={examConfig.only_new}
                  onChange={(e) => setExamConfig({...examConfig, only_new: e.target.checked})}
                />
                <Label htmlFor="only_new">Apenas questões novas</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Simulado
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Simulados */}
      <div className="grid gap-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{exam.name}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{exam.total_questions} questões</span>
                    <span>{exam.answered_questions} respondidas</span>
                    {exam.answered_questions > 0 && (
                      <span className={`font-medium ${getScoreColor(exam.score)}`}>
                        {exam.score.toFixed(1)}% de acerto
                      </span>
                    )}
                  </div>
                  {exam.answered_questions > 0 && (
                    <Progress 
                      value={(exam.answered_questions / exam.total_questions) * 100} 
                      className="mt-2 w-full max-w-xs"
                    />
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStartExam(exam.id)}
                    disabled={exam.answered_questions === exam.total_questions}
                  >
                    {exam.answered_questions === 0 ? (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Iniciar
                      </>
                    ) : exam.answered_questions < exam.total_questions ? (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Continuar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Revisar
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {exams.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum simulado encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Crie seu primeiro simulado para começar!</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog do Simulado */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {currentExam && (
            <>
              <DialogHeader>
                <DialogTitle>{currentExam.name}</DialogTitle>
                <DialogDescription>
                  Questão {currentQuestionIndex + 1} de {currentExam.questions.length}
                </DialogDescription>
                <Progress 
                  value={((currentQuestionIndex + 1) / currentExam.questions.length) * 100} 
                  className="w-full"
                />
              </DialogHeader>
              
              {currentExam.questions[currentQuestionIndex] && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-2">
                      {currentExam.questions[currentQuestionIndex].text}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Badge variant="outline">
                        {currentExam.questions[currentQuestionIndex].subject_name}
                      </Badge>
                      <Badge variant="outline">
                        {currentExam.questions[currentQuestionIndex].difficulty === 'Easy' ? 'Fácil' : 
                         currentExam.questions[currentQuestionIndex].difficulty === 'Medium' ? 'Médio' : 'Difícil'}
                      </Badge>
                    </div>
                  </div>

                  <RadioGroup 
                    value={userAnswers[currentExam.questions[currentQuestionIndex].id] || ''}
                    onValueChange={handleAnswerQuestion}
                  >
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <div key={option} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value={option} id={option} />
                          <Label htmlFor={option} className="flex-1 cursor-pointer">
                            <strong>{option})</strong> {currentExam.questions[currentQuestionIndex][`option_${option.toLowerCase()}`]}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setIsExamDialogOpen(false)}
                    >
                      Sair do Simulado
                    </Button>
                    <Button 
                      onClick={handleNextQuestion}
                      disabled={!userAnswers[currentExam.questions[currentQuestionIndex].id]}
                    >
                      {currentQuestionIndex < currentExam.questions.length - 1 ? 'Próxima' : 'Finalizar'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Exams
