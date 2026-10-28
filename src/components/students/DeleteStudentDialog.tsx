import { useNavigate } from "react-router"
import { getErrorMessage } from "../../api/apiError"
import { useDeleteStudent } from "../../api/students/hook"
import { useToast } from "../../context/useToast"
import ConfirmDialog from "../ui/ConfirmDialog"

export type DeleteStudentDialogProps={
isOpen:boolean
onClose:()=>void,
student:{id:number,fullName:string}
}
export default function DeleteStudentDialog({student,isOpen,onClose}:DeleteStudentDialogProps){
const remove=useDeleteStudent();
const toast=useToast();
const navigate=useNavigate();


function handleConfirm() {
  remove.mutate(student.id, {
    onSuccess: () => {
      navigate("/students", { replace: true });
      toast.success("התלמידה הוסרה");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
      onClose();
    },
  });
}
return (
    <ConfirmDialog tone="danger" title="מחיקת תלמידה" confirmText="מחיקה" 
    message={` למחוק את ${student.fullName}? אם יש לה היסטוריה (רישומים, נוכחות או דוחות), היא תועבר לארכיון והרישומים הפעילים שלה יבוטלו. אחרת היא תימחק לגמרי.`}
    onClose={onClose}
    onConfirm={handleConfirm}
    isOpen={isOpen}
    cancelText="ביטול"
    ></ConfirmDialog>
)

}