import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GiveCookie: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        Cookies.set(import.meta.env.VITE_ADMIN_KEY, 'true', {
            expires: 7,
            sameSite: 'lax',
            secure: true,
        });

        navigate(-1);
    }, [navigate])

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>Proccessing, please wait...</p>
        </div>   
    );
}