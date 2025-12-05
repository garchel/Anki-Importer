import './App.css'
import { AppLayout } from './components/AppLayout';
import { SettingsProvider } from '@/components/context/SettingsContext'

function App() {
	return (
		<SettingsProvider>
			<AppLayout />
		</SettingsProvider>
	);
}

export default App