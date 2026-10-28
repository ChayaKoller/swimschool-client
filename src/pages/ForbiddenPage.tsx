import { useNavigate } from "react-router";
import { House } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-xl pt-8">
      <EmptyState
        title="העמוד הזה מיועד למורה בלבד"
        description="למשתמשת שלך אין הרשאה לפתוח אותו. אם צריך, אפשר לבקש מהמורה."
        action={
          <Button variant="secondary" icon={<House />} onClick={() => navigate("/")}>
            חזרה לדף הבית
          </Button>
        }
      />
    </div>
  );
}