import { useBlocker } from "react-router"
import ConfirmDialog from "../ui/ConfirmDialog"
import { useEffect } from "react"

export type UnsavedChangesGuardProps={
    when: boolean 

}
export default function UnsavedChangesGuard({when}:UnsavedChangesGuardProps){
    const blocker = useBlocker(when)
    useEffect(() => {
  if (!when) return; 
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    event.preventDefault(); 
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [when]);
return (<ConfirmDialog
  isOpen={blocker.state === "blocked"}
  onConfirm={() => blocker.proceed?.()}
  onClose={() => blocker.reset?.()}
  title="יש שינויים שלא נשמרו"
  message="אם תצאי עכשיו, השינויים לא יישמרו."
  confirmText="יציאה בלי שמירה"
/>)
}