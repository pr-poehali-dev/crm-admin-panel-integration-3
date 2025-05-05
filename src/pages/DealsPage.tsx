
import { useState, useEffect } from "react";
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
import { api, Deal, Client } from "@/components/services/api";

const DealsPage = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    amount: 0,
    stage: "initial",
    probability: 0,
    expectedCloseDate: ""
  });

  // Загрузка сделок и клиентов
  const loadData = async () => {
    setIsLoading(true);
    try {
      const dealsResponse = await api.getDeals();
      const clientsResponse = await api.getClients();
      
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
      
      const stages = ["initial", "negotiation", "proposal", "contract", "closed", "lost"];
      
      const mockDeals: Deal[] = Array.from({ length: 25 }, (_, i) => ({
        id: `deal-${i + 1}`,
        title: `Сделка ${i + 1}`,
        clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
        amount: Math.floor(Math.random() * 1000000) + 10000,
        stage: stages[Math.floor(Math.random() * stages.length)],
        probability: Math.floor(Math.random() * 100),
        expectedCloseDate: new Date(Date.now() + (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)).toISOString(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      setClients(mockClients);
      setDeals(mockDeals);
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
    setCurrentDeal(null);
    setFormData({
      title: "",
      clientId: "",
      amount: 0,
      stage: "initial",
      probability: 20,
      expectedCloseDate: new Date().toISOString().split('T')[0]
    });
    setFormOpen(true);
  };

  // Обработчик нажатия на строку таблицы для редактирования
  const handleEdit = (deal: Deal) => {
    setCurrentDeal(deal);
    setFormData({
      title: deal.title,
      clientId: deal.clientId,
      amount: deal.amount,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0]
    });
    setFormOpen(true);
  };

  // Получение имени клиента по ID
  const getClientNameById = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Неизвестный клиент';
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!formData.title || !formData.clientId || formData.amount <= 0 || !formData.expectedCloseDate) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    try {
      if (currentDeal) {
        // Редактирование существующей сделки
        await api.updateDeal(currentDeal.id, formData);
        
        // Обновляем список локально для демонстрации
        setDeals(deals.map(deal => 
          deal.id === currentDeal.id 
            ? { 
                ...deal, 
                ...formData,
                expectedCloseDate: new Date(formData.expectedCloseDate).toISOString()
              } 
            : deal
        ));

        toast({
          title: "Успех",
          description: "Сделка успешно обновлена",
        });
      } else {
        // Создание новой сделки
        await api.createDeal({
          ...formData,
          expectedCloseDate: new Date(formData.expectedCloseDate).toISOString()
        });
        
        // Добавляем в список локально для демонстрации
        const newDeal: Deal = {
          id: `deal-${Date.now()}`,
          ...formData,
          expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
          createdAt: new Date().toISOString()
        };
        
        setDeals([newDeal, ...deals]);

        toast({
          title: "Успех",
          description: "Сделка успешно создана",
        });
      }
      
      setFormOpen(false);
    } catch (error) {
      console.error("Ошибка при сохранении сделки:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные сделки",
        variant: "destructive",
      });
    }
  };

  // Обработчик удаления сделки
  const handleDelete = async (deal: Deal) => {
    if (!confirm(`Вы действительно хотите удалить сделку "${deal.title}"?`)) {
      return;
    }

    try {
      await api.deleteDeal(deal.id);
      
      // Удаляем из списка локально для демонстрации
      setDeals(deals.filter(d => d.id !== deal.id));

      toast({
        title: "Успех",
        description: "Сделка успешно удалена",
      });
    } catch (error) {
      console.error("Ошибка при удалении сделки:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сделку",
        variant: "destructive",
      });
    }
  };

  const getStageLabel = (stage: string): { label: string; color: string } => {
    const stageMap: Record<string, { label: string; color: string }> = {
      initial: { label: "Первичный контакт", color: "bg-gray-100 text-gray-800" },
      negotiation: { label: "Переговоры", color: "bg-blue-100 text-blue-800" },
      proposal: { label: "Предложение", color: "bg-yellow-100 text-yellow-800" },
      contract: { label: "Контракт", color: "bg-orange-100 text-orange-800" },
      closed: { label: "Закрыта", color: "bg-green-100 text-green-800" },
      lost: { label: "Утеряна", color: "bg-red-100 text-red-800" },
    };
    
    return stageMap[stage] || { label: stage, color: "bg-gray-100 text-gray-800" };
  };

  const columns = [
    {
      key: "title",
      header: "Название",
      sortable: true,
    },
    {
      key: "clientId",
      header: "Клиент",
      sortable: true,
      render: (deal: Deal) => getClientNameById(deal.clientId),
    },
    {
      key: "amount",
      header: "Сумма",
      sortable: true,
      render: (deal: Deal) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(deal.amount)
    },
    {
      key: "stage",
      header: "Этап",
      sortable: true,
      render: (deal: Deal) => {
        const stage = getStageLabel(deal.stage);
        return (
          <Badge className={stage.color}>
            {stage.label}
          </Badge>
        );
      },
    },
    {
      key: "probability",
      header: "Вероятность",
      sortable: true,
      render: (deal: Deal) => `${deal.probability}%`
    },
    {
      key: "expectedCloseDate",
      header: "Дата закрытия",
      sortable: true,
      render: (deal: Deal) => {
        const date = new Date(deal.expectedCloseDate);
        return date.toLocaleDateString("ru-RU");
      },
    },
    {
      key: "createdAt",
      header: "Дата создания",
      sortable: true,
      render: (deal: Deal) => {
        const date = new Date(deal.createdAt);
        return date.toLocaleDateString("ru-RU");
      },
    },
    {
      key: "actions",
      header: "Действия",
      render: (deal: Deal) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(deal);
            }}
          >
            <Icon name="Edit" className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(deal);
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
            <CardTitle>Сделки</CardTitle>
            <CardDescription>
              Управление сделками и продажами
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Icon name="Plus" className="mr-2 h-4 w-4" />
            Добавить сделку
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={deals}
            keyExtractor={(deal) => deal.id}
            isLoading={isLoading}
            onRowClick={handleEdit}
            searchPlaceholder="Поиск сделок..."
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
        title={currentDeal ? "Редактировать сделку" : "Создать сделку"}
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
              placeholder="Введите название сделки"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="clientId">Клиент *</Label>
            <Select
              value={formData.clientId}
              onValueChange={(value) => setFormData({ ...formData, clientId: value })}
            >
              <SelectTrigger id="clientId">
                <SelectValue placeholder="Выберите клиента" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Сумма *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              placeholder="0"
              min="0"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="stage">Этап *</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => setFormData({ ...formData, stage: value })}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Выберите этап" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">Первичный контакт</SelectItem>
                <SelectItem value="negotiation">Переговоры</SelectItem>
                <SelectItem value="proposal">Предложение</SelectItem>
                <SelectItem value="contract">Контракт</SelectItem>
                <SelectItem value="closed">Закрыта</SelectItem>
                <SelectItem value="lost">Утеряна</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="probability">Вероятность (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="probability"
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                min="0"
                max="100"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="expectedCloseDate">Ожидаемая дата закрытия *</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
              required
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

export default DealsPage;
