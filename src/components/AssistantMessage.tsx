import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type MessageProps = {
  content: string;
};

function detectJsonType(obj: any): "payment" | "counterparty" | "unknown" {
  if ("amount" in obj && "account Recipient" in obj) return "payment";
  if ("name" in obj && "iin" in obj) return "counterparty";
  return "unknown";
}

export function AssistantMessage({ content }: MessageProps) {
  const [jsonData, setJsonData] = useState<any | null>(null);
  const [jsonType, setJsonType] = useState<"payment" | "counterparty" | "unknown">("unknown");

  useEffect(() => {
    const match = content.match(/Final Response:\s*JSON\s*({[\s\S]*?})/i);
    if (match) {
      try {
        const cleanedJson = match[1].replace(/“|”/g, '"'); // replace smart quotes
        const parsed = JSON.parse(cleanedJson);
        setJsonData(parsed);
        setJsonType(detectJsonType(parsed));
      } catch (e) {
        console.warn("Ошибка парсинга JSON:", e);
      }
    }
  }, [content]);

  if (jsonData && jsonType === "payment") {
    return (
      <div className="rounded-lg border p-4 bg-muted/40 max-w-md mx-auto my-4">
        <h3 className="text-lg font-semibold mb-2">💸 Платёж</h3>
        <div><strong>Сумма:</strong> {jsonData.amount} {jsonData.currency}</div>
        <div><strong>Описание:</strong> {jsonData.description}</div>
        <div><strong>Счёт получателя:</strong> {jsonData["account Recipient"]}</div>
        <Button className="mt-4 w-auto">Подписать платёж</Button>
      </div>
    );
  }

  if (jsonData && jsonType === "counterparty") {
    return (
      <div className="rounded-lg border p-4 bg-muted/40 max-w-md mx-auto my-4">
        <h3 className="text-lg font-semibold mb-2">📋 Контрагент</h3>
        <div><strong>Имя:</strong> {jsonData.name}</div>
        <div><strong>IIN:</strong> {jsonData.iin}</div>
        <div><strong>IBAN:</strong> {jsonData.iban}</div>
        <Button className="mt-4 w-auto">Добавить контрагента</Button>
      </div>
    );
  }

  // Если нет JSON — показываем обычное сообщение
  return <p className="whitespace-pre-line">{content}</p>;
}
