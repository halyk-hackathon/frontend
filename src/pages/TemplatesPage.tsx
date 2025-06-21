import { ArrowLeft, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";

const plans = [
  {
    name: "Start",
    price: "0 ₸ / мес",
    features: [
      "Создание платёжек по тексту",
      "Справки и PDF-документы",
      "Безлимитные контрагенты",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "9 900 ₸ / мес",
    features: [
      "Налоговые формы: 910, 200, 701",
      "Обработка сотрудников и ЗП",
      "Автозаполнение деклараций",
      "История всех действий",
    ],
    highlight: true,
  },
  {
    name: "Business",
    price: "19 900 ₸ / мес",
    features: [
      "Интеграция с 1C и CRM",
      "Финансовая аналитика по платежам",
      "Групповой доступ и роли",
      "Приоритетная поддержка",
    ],
    highlight: false,
  },
];

export default function TemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container max-w-6xl p-4 md:p-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Назад
            </Link>
          </Button>
        </div>

        <section className="text-center py-6">
          <h1 className="text-4xl font-bold mb-2">Монетизация AI-ассистента</h1>
          <p className="text-muted-foreground mb-10">
            Выберите подходящий план для вашего бизнеса
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`transition hover:shadow-xl border ${
                  plan.highlight ? "border-primary" : "border-muted"
                }`}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-xl text-primary mt-2">{plan.price}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ul className="text-left list-none text-sm text-muted-foreground space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-1" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    Выбрать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
