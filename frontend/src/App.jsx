
import './App.css'
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import NavBarSelector from './components/NavBarSelector';
import { useLocation } from 'react-router-dom'

const publicRoutes = ['/login']

function App() {

    const { pathname } = useLocation()
    const shouldShowNavbar = !publicRoutes.includes(pathname)
    return (
        <AuthProvider>
            {shouldShowNavbar && <NavBarSelector />}
            <AppRoutes />
        </AuthProvider>
    );
}


export default App
