import { useAuthStore } from "@/stores/authStore";
import Button from "../Button";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";
import { LiaSignOutAltSolid } from "react-icons/lia";


export default function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LANDING);
  };

  return (
    <Button onClick={handleLogout} variant='ghost' className="">
      <LiaSignOutAltSolid className="text-xl text-error"/>
    </Button>
  );
}