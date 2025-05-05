
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import { api, Task, Client, Deal } from "@/components/services/api";

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigneeId: "",
    relatedTo: {
      type: "" as "client" | "deal" | "",
      id: ""
    },
    dueDate: "",
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"]
  });

  // Загрузка задач, клиентов и сделок
  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        api.getTasks(),
        api.getClients(),
        api.getDeals()
      ]);
      
      // Для демонстрационных целей создадим фиктивные данные
      const mockClients: Client[] = Array.from({ length: 10 }, (_, i) => ({
        id: `client-${i + 1}`,
        name: `Клиент ${i + 1}`,
        email: `client${i + 1}@example.com`,
        phone: `+7 (9${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
        company: i % 3 === 0 ? `Компания ${i + 1}` : undefined,
        status: i % 5 === 0 ? "active" : i % 4 === 0 ? "inactive" : "lead",
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const mockDeals: Deal[] = Array.from({ length: 10 }, (_, i) => ({
        id: `deal-${i + 1}`,
        title: `Сделка ${i + 1}`,
        clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
        amount: Math.floor(Math.random() * 1000000) + 10000,
        stage: ["initial", "negotiation", "proposal", "contract", "closed", "lost"][Math.floor(Math.random() * 6)],
        probability: Math.floor(Math.random() * 100),
        expectedCloseDate: new Date(Date.now() + (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const assignees = ["user-1", "user-2", "user-3", "user-4"];
      const assigneeNames = ["Иван Петров", "Анна Смирнова", "Максим Иванов", "Елена Кузнецова"];
      
      const mockTasks: Task[] = Array.from({ length: 20 }, (_, i) => {
        const relatedType = Math.random() > 0.5 ? "client" : "deal";
        const relatedOptions = relatedType === "client" ? mockClients : mockDeals;
        const relatedEntity = relatedOptions[Math.floor(Math.random() * relatedOptions.length)];
        
        const assigneeIndex = Math.floor(Math.random() * assignees.length);
        
        return {
          id: `task-${i + 1}`,
          title: `Задача ${i + 1}`,
          description: Math.random() > 0.3 ? `Описание задачи ${i + 1}` : undefined,
          assigneeId: assignees[assigneeIndex],
          relatedTo: Math.random() > 0.2 ? {
            type: relatedType as "client" | "deal",
            id: relatedEntity.id
          } : undefined,
          dueDate: new Date(Date.now() + (Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)).toISOString(),
          status: ["todo", "in_progress", "done", "canceled"][Math.floor(Math.random() * 4)] as Task["status"],
          priority: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as Task["priority"]
        };
      });
      
      setClients(mockClients);
      setDeals(mockDeals);
      setTasks(mockTasks);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Обработчик нажатия на кнопку "Создать"
  const handleCreate = () => {
    setCurrentTask(null);
    setFormData({
      title: "",
      description: "",
      assigneeId: "",
      relatedTo: {
        type: "",
        id: ""
      },
      dueDate: new Date().toISOString().split('T')[0],
      status: "todo",
      priority: "medium"
    });
    setFormOpen(true);
  };

  // Обработчик нажатия на строку таблицы для редактирования
  const handleEdit = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      assigneeId: task.assigneeId,
      relatedTo: task.relatedTo ? task.relatedTo : {
        type: "",
        id: ""
      },
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      status: task.status,
      priority: task.priority
    });
    setFormOpen(true);
  };

  // Получение имени связанной сущности
  const getRelatedEntityName = (relatedTo?: { type: 'client' | 'deal'; id: string }): string => {
    if (!relatedTo) return '—';
    
    if (relatedTo.type === 'client') {
      const client = clients.find(c => c.id === relatedTo.id);
      return client ? client.name : 'Неизвестный клиент';
    } else {
      const deal = deals.find(d => d.id === relatedTo.id);
      return deal ? deal.title : 'Неизвестная сделка';
    }
  };

  // Получение имени исполнителя
  const getAssigneeName = (assigneeId: string): string => {
    const assigneeMap: Record<string, string> = {
      "user-1": "Иван Петров",
      "user-2": "Анна Смирнова",
      "user-3": "Максим Иванов",
      "user-4": "Елена Кузнецова"
    };
    
    return assigneeMap[assigneeId] || 'Неизвестный исполнитель';
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!formData.title || !formData.assigneeId || !formData.dueDate) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      // Подготовка данных для отправки
      const taskData = {
        ...formData,
        relatedTo: formData.relatedTo.type && formData.relatedTo.id 
          ? { type: formData.relatedTo.type, id: formData.relatedTo.id } 
          : undefined,
        description: formData.description || undefined
      };
      
      if (currentTask) {
        // Редактирование существующей задачи
        await api.updateTask(currentTask.id, taskData);
        
        // Обновляем список локально для демонстрации
        setTasks(tasks.map(task => 
          task.id === currentTask.id 
            ? { 
                ...task, 
                ...taskData,
                dueDate: new Date(formData.dueDate).toISOString()
              } 
            : task
        ));

        toast({
          title: "Успех",
          description: "Задача успешно обновлена",
        });
      } else {
        // Создание новой задачи
        await api.createTask({
          ...taskData,
          dueDate: new Date(formData.dueDate).toISOString()
        });
        
        // Добавляем в список локально для демонстрации
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          dueDate: new Date(formData.dueDate).toISOString()
        };
        
        setTasks([newTask, ...tasks]);

        toast({
          title: "Успех",
          description: "Задача успешно создана",
        });
      }
      
      setFormOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении задачи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные задачи",
        variant: "destructive",
      });
    }
  };

  // Обработчик удаления задачи
  const handleDelete = async (task: Task) => {
    if (!confirm(`Вы действительно хотите удалить задачу "${task.title}"?`)) {
      return;
    }

    try {
      await api.deleteTask(task.id);
      
      // Удаляем из списка локально для демонстрации
      setTasks(tasks.filter(t => t.id !== task.id));

      toast({
        title: "Успех",
        description: "Задача успешно удалена",
      });
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      });
    }
  };

  // Получение статусов и приоритетов
  const getStatusInfo = (status: Task["status"]): { label: string; color: string } => {
    const statusMap: Record<Task["status"], { label: string; color: string }> = {
      todo: { label: "Новая", color: "bg-blue-100 text-blue-800" },
      in_progress: { label: "В работе", color: "bg-yellow-100 text-yellow-800" },
      done: { label: "Выполнена", color: "bg-green-100 text-green-800" },
      canceled: { label: "Отменена", color: "bg-gray-100 text-gray-800" }
    };
    
    return statusMap[status];
  };

  const getPriorityInfo = (priority: Task["priority"]): { label: string; color: string } => {
    const priorityMap: Record<Task["priority"], { label: string; color: string }> = {
      low: { label: "Низкий", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Средний", color: "bg-blue-100 text-blue-800" },
      high: { label: "Высокий", color: "bg-red-100 text-red-800" }
    };
    
    return priorityMap[priority];
  };

  const columns = [
    {
      key: "title",
      header: "Название",
      sortable: true,
    },
    {
      key: "assigneeId",
      header: "Исполнитель",
      sortable: true,
      render: (task: Task) => getAssigneeName(task.assigneeId),
    },
    {
      key: "relatedTo",
      header: "Связано с",
      render: (task: Task) => getRelatedEntityName(task.relatedTo),
    },
    {
      key: "status",
      header: "Статус",
      sortable: true,
      render: (task: Task) => {
        const status = getStatusInfo(task.status);
        return (
          <Badge className={status.color}>
            {status.label}
          </Badge>
        );
      },
    },
    {
      key: "priority",
      header: "Приоритет",
      sortable: true,
      render: (task: Task) => {
        const priority = getPriorityInfo(task.priority);
        return (
          <Badge className={priority.color}>
            {priority.label}
          </Badge>
        );
      },
    },
    {
      key: "dueDate",
      header: "Срок",
      sortable: true,
      render: (task: Task) => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const isOverdue = dueDate < now && task.status !== "done" && task.status !== "canceled";
        
        return (
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {dueDate.toLocaleDateString("ru-RU")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Действия",
      render: (task: Task) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(task);
            }}
          >
            <Icon name="Edit" className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(task);
            }}
          >
            <Icon name="Trash2" className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Задачи</CardTitle>
            <CardDescription>
              Управление задачами и активностями
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Добавить задачу
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tasks}
            keyExtractor={(task) => task.id}
            isLoading={isLoading}
            onRowClick={handleEdit}
            searchPlaceholder="Поиск задач..."
            actions={
              <Button variant="outline" onClick={loadData} size="sm">
                <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                Обновить
              </Button>
            }
          />
        </CardContent>
      </Card>

      <FormDialog
        title={currentTask ? "Редактировать задачу" : "Создать задачу"}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите название задачи"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Введите описание задачи"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="assigneeId">Исполнитель *</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
            >
              <SelectTrigger id="assigneeId">
                <SelectValue placeholder="Выберите исполнителя" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user-1">Иван Петров</SelectItem>
                <SelectItem value="user-2">Анна Смирнова</SelectItem>
                <SelectItem value="user-3">Максим Иванов</SelectItem>
                <SelectItem value="user-4">Елена Кузнецова</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Связано с</Label>
            <div className="grid gap-2">
              <Select
                value={formData.relatedTo.type}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  relatedTo: { 
                    type: value as "client" | "deal" | "",
                    id: "" 
                  } 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ничего</SelectItem>
                  <SelectItem value="client">Клиент</SelectItem>
                  <SelectItem value="deal">Сделка</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.relatedTo.type && (
                <Select
                  value={formData.relatedTo.id}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    relatedTo: { 
                      ...formData.relatedTo,
                      id: value 
                    } 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Выберите ${formData.relatedTo.type === "client" ? "клиента" : "сделку"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.relatedTo.type === "client" 
                      ? clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))
                      : deals.map(deal => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.title}
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="dueDate">Срок исполнения *</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Статус *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Новая</SelectItem>
                <SelectItem value="in_progress">В работе</SelectItem>
                <SelectItem value="done">Выполнена</SelectItem>
                <SelectItem value="canceled">Отменена</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Приоритет *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Выберите приоритет" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default TasksPage;
