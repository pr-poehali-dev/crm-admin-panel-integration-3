
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { FormDialog } from "@/components/FormDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";
import { api, Client } from "@/components/services/api";

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead" as Client["status"]
  });

  // Загрузка клиентов
  const loadClients = async () => {
    setIsLoading(true);
    try {
      const response = await api.getClients();
      if (response.success) {
        // Для демонстрационных целей создадим фиктивные данные
        const mockClients: Client[] = Array.from({ length: 30 }, (_, i) => ({
          id: `client-${i + 1}`,
          name: `Клиент ${i + 1}`,
          email: `client${i + 1}@example.com`,
          phone: `+7 (9${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
          company: i % 3 === 0 ? `Компания ${i + 1}` : undefined,
          status: i % 5 === 0 ? "active" : i % 4 === 0 ? "inactive" : "lead",
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        setClients(mockClients);
      }
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список клиентов",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Обработчик нажатия на кнопку "Создать"
  const handleCreate = () => {
    setCurrentClient(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "lead"
    });
    setFormOpen(true);
  };

  // Обработчик нажатия на строку таблицы для редактирования
  const handleEdit = (client: Client) => {
    setCurrentClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company || "",
      status: client.status
    });
    setFormOpen(true);
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentClient) {
        // Редактирование существующего клиента
        await api.updateClient(currentClient.id, {
          ...formData,
          company: formData.company || undefined
        });
        
        // Обновляем список локально для демонстрации
        setClients(clients.map(client => 
          client.id === currentClient.id 
            ? { 
                ...client, 
                ...formData,
                company: formData.company || undefined
              } 
            : client
        ));

        toast({
          title: "Успех",
          description: "Клиент успешно обновлен",
        });
      } else {
        // Создание нового клиента
        await api.createClient({
          ...formData,
          company: formData.company || undefined
        });
        
        // Добавляем в список локально для демонстрации
        const newClient: Client = {
          id: `client-${Date.now()}`,
          ...formData,
          company: formData.company || undefined,
          createdAt: new Date().toISOString()
        };
        
        setClients([newClient, ...clients]);

        toast({
          title: "Успех",
          description: "Клиент успешно создан",
        });
      }
      
      setFormOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные клиента",
        variant: "destructive",
      });
    }
  };

  // Обработчик удаления клиента
  const handleDelete = async (client: Client) => {
    if (!confirm(`Вы действительно хотите удалить клиента "${client.name}"?`)) {
      return;
    }

    try {
      await api.deleteClient(client.id);
      
      // Удаляем из списка локально для демонстрации
      setClients(clients.filter(c => c.id !== client.id));

      toast({
        title: "Успех",
        description: "Клиент успешно удален",
      });
    } catch (error) {
      console.error("Ошибка при удалении клиента:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить клиента",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "name",
      header: "Имя",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "phone",
      header: "Телефон",
    },
    {
      key: "company",
      header: "Компания",
      sortable: true,
    },
    {
      key: "status",
      header: "Статус",
      sortable: true,
      render: (client: Client) => {
        const statusMap = {
          active: { label: "Активен", variant: "default", color: "bg-green-100 text-green-800" },
          inactive: { label: "Неактивен", variant: "outline", color: "bg-gray-100 text-gray-800" },
          lead: { label: "Лид", variant: "secondary", color: "bg-blue-100 text-blue-800" },
        };
        
        const status = statusMap[client.status];
        
        return (
          <Badge className={status.color}>
            {status.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Дата создания",
      sortable: true,
      render: (client: Client) => {
        const date = new Date(client.createdAt);
        return date.toLocaleDateString("ru-RU");
      },
    },
    {
      key: "actions",
      header: "Действия",
      render: (client: Client) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(client);
            }}
          >
            <Icon name="Edit" className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(client);
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
            <CardTitle>Клиенты</CardTitle>
            <CardDescription>
              Управление клиентами и лидами
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Добавить клиента
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={clients}
            keyExtractor={(client) => client.id}
            isLoading={isLoading}
            onRowClick={handleEdit}
            searchPlaceholder="Поиск клиентов..."
            actions={
              <Button variant="outline" onClick={loadClients} size="sm">
                <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                Обновить
              </Button>
            }
          />
        </CardContent>
      </Card>

      <FormDialog
        title={currentClient ? "Редактировать клиента" : "Создать клиента"}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите имя клиента"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@example.com"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (XXX) XXX-XX-XX"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">Компания</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Введите название компании"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Статус *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Client["status"] })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lead">Лид</SelectItem>
                <SelectItem value="active">Активен</SelectItem>
                <SelectItem value="inactive">Неактивен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default ClientsPage;
