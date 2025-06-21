import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type MessageProps = {
  content: string;
};

// Универсальный рендер JSON-объекта
function renderJsonBlock(json: Record<string, any>) {
  return (
    <div className="rounded-lg border p-4 bg-muted/40 max-w-md mx-auto my-4">
      <h3 className="text-lg font-semibold mb-2">📦 Данные</h3>
      {Object.entries(json).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {String(value)}
        </div>
      ))}
      <Button className="w-full">Подписать</Button>
    </div>
  );
}

export function AssistantMessage({ content }: MessageProps) {
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    try {
      // Удаляем лишние пробелы и символы до JSON (если они есть)
      const trimmed = content.trim();

      // Попытка сразу распарсить весь контент
      const cleaned = trimmed.replace(/“|”/g, '"'); // заменяем кавычки
      const parsed = JSON.parse(cleaned);

      if (typeof parsed === "object" && parsed !== null) {
        setJsonData(parsed);
      }
    } catch (e) {
      // Не валидный JSON — ничего не делаем
    }
  }, [content]);

  if (jsonData) {
    return renderJsonBlock(jsonData);
  }

  // Если не JSON — просто текст
  return <p className="whitespace-pre-line">{content}</p>;
}
