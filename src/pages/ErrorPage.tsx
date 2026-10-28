import { RefreshCw } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function ErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-page p-4">
      <div className="w-full max-w-xl">
        <EmptyState
          title="משהו השתבש"
          description="קרתה שגיאה בטעינת העמוד. אפשר לרענן ולנסות שוב."
          action={
            <Button icon={<RefreshCw />} onClick={() => window.location.reload()}>
              רענון העמוד
            </Button>
          }
        />
      </div>
    </main>
  );
}