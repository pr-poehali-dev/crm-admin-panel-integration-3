
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Имитация данных API
const fetchDashboardData = () => {
  return new Promise<{
    stats: { leads: number; sales: number; tasks: number; revenue: number };
    recentActivity: Array<{ id: number; action: string; user: string; time: string }>;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        stats: {
          leads: 142,
          sales: 87,
          tasks: 34,
          revenue: 840000
        },
        recentActivity: [
          { id: 1, action: "Новый лид добавлен", user: "Анна К.", time: "10 мин назад" },
          { id: 2, action: "Сделка закрыта", user: "Виктор П.", time: "42 мин назад" },
          { id: 3, action: "Задача выполнена", user: "Мария С.", time: "1 час назад" },
          { id: 4, action: "Комментарий добавлен", user: "Дмитрий В.", time: "3 часа назад" }
        ]
      });
    }, 500);
  });
};

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: { leads: number; sales: number; tasks: number; revenue: number };
    recentActivity: Array<{ id: number; action: string; user: string; time: string }>;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Админ-панель CRM</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Icon name="BellRing" className="mr-2 h-4 w-4" />
              Уведомления
            </Button>
            <Button variant="outline" size="sm">
              <Icon name="User" className="mr-2 h-4 w-4" />
              Профиль
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-6 px-4">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
            <TabsTrigger value="clients">Клиенты</TabsTrigger>
            <TabsTrigger value="deals">Сделки</TabsTrigger>
            <TabsTrigger value="tasks">Задачи</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Icon name="Loader2" className="animate-spin h-10 w-10 text-primary" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Лиды
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{dashboardData?.stats.leads}</div>
                        <Icon name="Users" className="h-6 w-6 text-primary" />
                      </div>
                      <Progress value={65} className="h-1 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Продажи
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{dashboardData?.stats.sales}</div>
                        <Icon name="BadgeCheck" className="h-6 w-6 text-green-500" />
                      </div>
                      <Progress value={42} className="h-1 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Задачи
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{dashboardData?.stats.tasks}</div>
                        <Icon name="ClipboardList" className="h-6 w-6 text-blue-500" />
                      </div>
                      <Progress value={28} className="h-1 mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Выручка
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(dashboardData?.stats.revenue || 0)}
                        </div>
                        <Icon name="BarChart" className="h-6 w-6 text-violet-500" />
                      </div>
                      <Progress value={78} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Активность за сегодня</CardTitle>
                        <CardDescription>
                          Последние действия пользователей в системе
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {dashboardData?.recentActivity.map((activity) => (
                            <div 
                              key={activity.id} 
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100"
                            >
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-sm text-muted-foreground">{activity.user}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>API Статус</CardTitle>
                      <CardDescription>
                        Состояние подключения и интеграций
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Icon name="CheckCircle" className="h-5 w-5 text-green-500 mr-2" />
                            <span>Основной API</span>
                          </span>
                          <span className="text-sm text-green-500">Активно</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Icon name="CheckCircle" className="h-5 w-5 text-green-500 mr-2" />
                            <span>Платежный шлюз</span>
                          </span>
                          <span className="text-sm text-green-500">Активно</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Icon name="AlertCircle" className="h-5 w-5 text-yellow-500 mr-2" />
                            <span>Email сервис</span>
                          </span>
                          <span className="text-sm text-yellow-500">Предупреждение</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center">
                            <Icon name="CheckCircle" className="h-5 w-5 text-green-500 mr-2" />
                            <span>Хранилище файлов</span>
                          </span>
                          <span className="text-sm text-green-500">Активно</span>
                        </div>
                        <Button className="w-full mt-4">
                          <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                          Обновить статус
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Клиенты</CardTitle>
                <CardDescription>
                  Здесь будет отображаться список клиентов и управление ими
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-10 text-muted-foreground">
                  <Icon name="Users" className="h-12 w-12 mx-auto mb-4" />
                  <p>Функциональность раздела клиентов будет доступна в следующем обновлении</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle>Сделки</CardTitle>
                <CardDescription>
                  Здесь будет отображаться список сделок и управление ими
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-10 text-muted-foreground">
                  <Icon name="BadgeCheck" className="h-12 w-12 mx-auto mb-4" />
                  <p>Функциональность раздела сделок будет доступна в следующем обновлении</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Задачи</CardTitle>
                <CardDescription>
                  Здесь будет отображаться список задач и управление ими
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-10 text-muted-foreground">
                  <Icon name="ClipboardList" className="h-12 w-12 mx-auto mb-4" />
                  <p>Функциональность раздела задач будет доступна в следующем обновлении</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки API</CardTitle>
                <CardDescription>
                  Управление интеграциями и настройками API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">API ключ</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        value="sk_test_51LQJ7M8DnFT52FT3jKVDFG8QK" 
                        disabled
                        className="flex-1 px-3 py-2 border rounded-l-md bg-gray-50"
                      />
                      <Button variant="outline" className="rounded-l-none">
                        <Icon name="Copy" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <label className="text-sm font-medium">Webhook URL</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        value="https://api.example.com/webhooks/crm" 
                        className="flex-1 px-3 py-2 border rounded-l-md"
                      />
                      <Button variant="outline" className="rounded-l-none">
                        <Icon name="Save" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    <label className="text-sm font-medium">Интеграции</label>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center">
                          <Icon name="MessageSquare" className="h-5 w-5 mr-2 text-blue-500" />
                          <span>Интеграция с мессенджерами</span>
                        </div>
                        <Button variant="outline" size="sm">Настроить</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center">
                          <Icon name="Inbox" className="h-5 w-5 mr-2 text-green-500" />
                          <span>Email интеграция</span>
                        </div>
                        <Button variant="outline" size="sm">Настроить</Button>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center">
                          <Icon name="CreditCard" className="h-5 w-5 mr-2 text-purple-500" />
                          <span>Платежная система</span>
                        </div>
                        <Button variant="outline" size="sm">Настроить</Button>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Icon name="Save" className="mr-2 h-4 w-4" />
                    Сохранить настройки
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
