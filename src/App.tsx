import './App.css'
import { AppLayout } from './components/AppLayout';
import { SettingsProvider } from '@/components/contexts/SettingsContext'

function App() {
    return (
			<SettingsProvider>
        <AppLayout /> 
			</SettingsProvider>
    );
}

export default App