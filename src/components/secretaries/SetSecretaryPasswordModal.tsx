import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useSetSecretaryPassword } from "../../api/secretaries/hook";
import { secretaryPasswordSchema, type SecretaryPasswordValues } from "../../api/secretaries/schema";
import { useToast } from "../../context/useToast";
import type { SecretaryDto } from "../../types/typesDtos";
import FormError from "../form/FormError";
import NewPasswordFields from "../form/NewPasswordFields";
import { useServerErrors } from "../form/useServerErrors";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export type SetSecretaryPasswordModalProps = {
    secretary: SecretaryDto;
    onClose: () => void;
};

const FORM_ID = "secretary-password-form";

export default function SetSecretaryPasswordModal({ secretary, onClose }: SetSecretaryPasswordModalProps) {
    const setPassword = useSetSecretaryPassword();
    const toast = useToast();

    const methods = useForm<SecretaryPasswordValues>({
        resolver: zodResolver(secretaryPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });
    const {
        handleSubmit,
        setError,
        formState: { isSubmitting },
    } = methods;
    const { formError, handleServerError } = useServerErrors(setError);

    const onSubmit = async (values: SecretaryPasswordValues) => {
        try {
            await setPassword.mutateAsync({ id: secretary.id, body: { newPassword: values.newPassword } });
            toast.success(`הסיסמה של ${secretary.fullName} הוחלפה`);
            onClose();
        } catch (error) {
            handleServerError(error);
        }
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="סיסמה חדשה"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
                        ביטול
                    </Button>
                    <Button type="submit" form={FORM_ID} isLoading={isSubmitting} icon={<KeyRound />}>
                        שמירה
                    </Button>
                </>
            }
        >
            <FormProvider {...methods}>
                <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                    <p className="rounded-control bg-page px-3 py-2 text-sm text-ink">
                        סיסמה חדשה ל<strong className="font-semibold text-line">{secretary.fullName}</strong>
                    </p>

                    <NewPasswordFields label="סיסמה חדשה" />

                    <FormError message={formError} />
                </form>
            </FormProvider>
        </Modal>
    );
}