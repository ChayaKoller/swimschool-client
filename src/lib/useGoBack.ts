import { useLocation, useNavigate } from "react-router";

export default function useGoBack(fallback:string){
    const navigate = useNavigate();
const location = useLocation();
return () => (location.key === "default" ? navigate(fallback) : navigate(-1));
}