import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const notifications = [
  {
    id: "1",
    type: "declaration",
    form: "Форма 910",
    title: "Сдача налоговой декларации",
    description:
      "Сдайте форму 910 до 3 числа текущего месяца, чтобы избежать штрафов. Форма предназначена для субъектов малого бизнеса и должна включать доходы за полугодие.",
    deadline: "2025-07-03",
    actionLabel: "Заполнить",
    priority: "high",
  },
  {
    id: "2",
    type: "salary",
    title: "Выплата заработной платы",
    description:
      "Выплатите ЗП сотрудникам за июнь до 2 июля, чтобы не нарушить Трудовой кодекс и избежать жалоб.",
    deadline: "2025-07-02",
    actionLabel: "Оплатить",
    priority: "medium",
  },
  {
    id: "3",
    type: "declaration",
    form: "Форма 200",
    title: "Сдача декларации",
    description:
      "Срок сдачи формы 200 — до 15 июля. Не забудьте включить все начисления по ИПН и СН за квартал.",
    deadline: "2025-07-15",
    actionLabel: "Заполнить",
    priority: "low",
  },
  {
    id: "4",
    type: "reminder",
    title: "Проверка контрагентов",
    description:
      "Проверьте актуальность банковских реквизитов контрагентов перед выплатами.",
    deadline: null,
    actionLabel: "Проверить",
    priority: "low",
  },
];

function getPriorityIcon(priority: string) {
  switch (priority) {
    case "high":
      return <AlertTriangle className="text-red-500 h-5 w-5" />;
    case "medium":
      return <Info className="text-yellow-500 h-5 w-5" />;
    case "low":
    default:
      return <CheckCircle className="text-muted-foreground h-5 w-5" />;
  }
}

export default function NotificationPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container ax-w-6xl mx-auto p-4 md:p-8">
        {/* Кнопка Назад — СЛЕВА */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2 px-0">
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </Link>
        </div>

        <section className="text-center py-6">
          <h1 className="text-4xl font-bold mb-2">Мои уведомления</h1>
          <p className="text-muted-foreground mb-10">
            Важные напоминания для вашего бизнеса
          </p>

          <div className="grid gap-6">
            {notifications.map((note) => (
              <Card key={note.id} className="transition hover:shadow-md">
                <CardHeader className="text-left">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(note.priority)}
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {note.description}
                  </p>
                  {note.form && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {note.form}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Button className="mt-2">{note.actionLabel}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
