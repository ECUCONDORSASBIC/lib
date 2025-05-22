// Wrapper para el hook de autenticación real
import { useAuth as useAuthContext } from '@/app/contexts/AuthContext';
export const useAuth = useAuthContext;
