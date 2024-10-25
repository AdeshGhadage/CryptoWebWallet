// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { WelcomePage } from './components/WelcomePage';
import { Dashboard } from './components/Dashboard';
import './App.css';



function App() {
  const [mnemonic, setMnemonic] = useState('');

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('mnemonic');
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<WelcomePage setMnemonic={setMnemonic} />}
        />
        <Route
          path="/dashboard"
          element={<Dashboard mnemonic={mnemonic} setMnemonic={setMnemonic} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
