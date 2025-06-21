import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import {
  ArrowRight,
  Bot,
  FileText,
  Settings,
  Sparkles,
  Users,
  UserCheck,
  FolderGit2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Index() {
  const { createNewConversation, settings } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document.documentElement.classList.add(`template-${settings.template}`);
  }, [settings.darkMode, settings.template]);

  const startNewChat = () => {
    const conversationId = createNewConversation();
    navigate(`/chat`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container max-w-7xl p-4 md:p-8">
        {/* Hero Section */}
        <section className="py-12 md:py-20 text-center">
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Bot className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Halyk Autopilot
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Ваш интеллектуальный помощник: создаёт платёжки, справки и налоговые формы за секунды.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={startNewChat} className="gap-2">
              Начать работу <ArrowRight className="h-4 w-4" />
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link to="/templates" className="gap-2">
                Планы <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Платёжки по описанию"
              description="Напишите 'Оплати аренду 250 000' — получите готовую платёжку с реквизитами."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Справки и PDF-документы"
              description="Автоматически создаёт договоры, заявки, акты, справки по шаблону."
            />
            <FeatureCard
              icon={<Settings className="h-8 w-8" />}
              title="Налоговые формы"
              description="910, 200, 701 — генерируются по вашим данным в один клик."
            />
            <FeatureCard
              icon={<UserCheck className="h-8 w-8" />}
              title="Список сотрудников"
              description="Загрузите Excel или введите вручную — AI рассчитает ЗП и налоги."
            />
            <FeatureCard
              icon={<FolderGit2 className="h-8 w-8" />}
              title="Список контрагентов"
              description="AI сам распознаёт и сохраняет ИИН/БИН, банк, реквизиты по платёжкам."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Контекстные подсказки"
              description="Система запоминает, кто, что и когда делал. Упоминания и автоответы."
            />
          </div>
        </section>

        {/* Plans Section */}
        <section className="py-12 md:py-20 text-center">
          <h2 className="text-3xl font-bold mb-10">Выберите подходящий план</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Start",
                price: "0 ₸ / мес",
                features: [
                  "Платёжки и справки по описанию",
                  "Список контрагентов",
                  "Безлимитное использование",
                ],
              },
              {
                name: "Pro",
                price: "9 900 ₸ / мес",
                features: [
                  "Автозаполнение форм 910, 200, 701",
                  "Загрузка сотрудников и расчёт ЗП",
                  "История действий и архив",
                ],
              },
              {
                name: "Business",
                price: "19 900 ₸ / мес",
                features: [
                  "Поддержка ЭЦП и CRM",
                  "Групповой доступ и роли",
                  "Финансовый анализ платежей",
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg p-6 border bg-card text-card-foreground shadow-md hover:shadow-lg transition"
                )}
              >
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-primary text-2xl font-bold mb-4">{plan.price}</p>
                <ul className="text-left space-y-2 text-sm text-muted-foreground mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                  Выбрать
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>
          Halyk Autopilot — AI-сервис для бизнеса от{" "}
          <a
            href="https://halykbank.kz"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Халык Банка
          </a>
        </p>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 transition-all animate-fade-in",
        "border bg-card text-card-foreground"
      )}
    >
      <div className="mb-4 rounded-full w-12 h-12 flex items-center justify-center bg-primary/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
