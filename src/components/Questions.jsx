import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'

const API_BASE = 'https://weltoncardoso.pythonanywhere.com'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('')
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: '',
    difficulty: '',
    subject_name: ''
  })

  useEffect(() => {
    fetchQuestions()
    fetchSubjects()
  }, [])

  useEffect(() => {
    filterQuestions()
  }, [questions, searchTerm, filterSubject, filterDifficulty])

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/questions`)
      const data = await response.json()
      setQuestions(data)
    } catch (error) {
      toast.error("Erro ao carregar questões")
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

  const filterQuestions = () => {
    let filtered = questions

    if (searchTerm) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterSubject) {
      filtered = filtered.filter(q => q.subject_id === parseInt(filterSubject))
    }

    if (filterDifficulty) {
      filtered = filtered.filter(q => q.difficulty === filterDifficulty)
    }

    setFilteredQuestions(filtered)
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      })

      if (response.ok) {
        toast.success("Questão adicionada com sucesso!")
        setIsAddDialogOpen(false)
        setNewQuestion({
          text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: '',
          difficulty: '',
          subject_name: ''
        })
        fetchQuestions()
        fetchSubjects()
      } else {
        throw new Error('Erro ao adicionar questão')
      }
    } catch (error) {
      toast.error("Erro ao adicionar questão")
    }
  }

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return

    try {
      const response = await fetch(`${API_BASE}/api/questions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success("Questão excluída com sucesso!")
        fetchQuestions()
      } else {
        throw new Error('Erro ao excluir questão')
      }
    } catch (error) {
      toast.error("Erro ao excluir questão")
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Questões</h1>
          <p className="text-gray-600">Adicione, edite e organize suas questões</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nova Questão</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Questão</DialogTitle>
              <DialogDescription>
                Preencha todos os campos para adicionar uma nova questão
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <Label htmlFor="text">Texto da Questão</Label>
                <Textarea
                  id="text"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="option_a">Alternativa A</Label>
                  <Input
                    id="option_a"
                    value={newQuestion.option_a}
                    onChange={(e) => setNewQuestion({...newQuestion, option_a: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option_b">Alternativa B</Label>
                  <Input
                    id="option_b"
                    value={newQuestion.option_b}
                    onChange={(e) => setNewQuestion({...newQuestion, option_b: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option_c">Alternativa C</Label>
                  <Input
                    id="option_c"
                    value={newQuestion.option_c}
                    onChange={(e) => setNewQuestion({...newQuestion, option_c: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="option_d">Alternativa D</Label>
                  <Input
                    id="option_d"
                    value={newQuestion.option_d}
                    onChange={(e) => setNewQuestion({...newQuestion, option_d: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="correct_option">Resposta Correta</Label>
                  <Select value={newQuestion.correct_option} onValueChange={(value) => setNewQuestion({...newQuestion, correct_option: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Fácil</SelectItem>
                      <SelectItem value="Medium">Médio</SelectItem>
                      <SelectItem value="Hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="subject_name">Assunto</Label>
                  <Input
                    id="subject_name"
                    value={newQuestion.subject_name}
                    onChange={(e) => setNewQuestion({...newQuestion, subject_name: e.target.value})}
                    placeholder="Nome do assunto"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Adicionar Questão
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Questões */}
      <div className="grid gap-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{question.text}</CardTitle>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">{question.subject_name}</Badge>
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty === 'Easy' ? 'Fácil' : 
                       question.difficulty === 'Medium' ? 'Médio' : 'Difícil'}
                    </Badge>
                    {question.is_new && <Badge className="bg-blue-100 text-blue-800">Nova</Badge>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>A) {question.option_a}</div>
                <div>B) {question.option_b}</div>
                <div>C) {question.option_c}</div>
                <div>D) {question.option_d}</div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Resposta correta:</strong> {question.correct_option}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhuma questão encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Questions
