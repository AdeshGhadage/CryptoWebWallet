import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateMnemonic, generateMnemonic } from 'bip39';

export function WelcomePage() {
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [isMnemonicGenerated, setIsMnemonicGenerated] = useState(false);
  const [inputMnemonic, setInputMnemonic] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('mnemonic');
    if (storedMnemonic) {
      setGeneratedMnemonic(storedMnemonic);
      setIsMnemonicGenerated(true);
    }
  }, []);

  const handleCreateSeed = async () => {
    if (inputMnemonic) {
      if (validateMnemonic(inputMnemonic)) {
        localStorage.setItem('mnemonic', inputMnemonic);
        setGeneratedMnemonic(inputMnemonic);
        setIsMnemonicGenerated(true);
        navigate('/dashboard');  // Redirect to SeedPhrasePage
      } else {
        setErrorMessage('Invalid mnemonic. Please enter a valid 12-word phrase.');
      }
    } else {
      const newMnemonic = await generateMnemonic();
      localStorage.setItem('mnemonic', newMnemonic);
      setGeneratedMnemonic(newMnemonic);
      setIsMnemonicGenerated(true);
      
    }
  };

  const handleInputMnemonic = (event) => {
    setInputMnemonic(event.target.value);
    setErrorMessage('');  // Clear any previous error message
  };

  const handleNoteClick = () => {
    navigate('/dashboard');  // Redirect to Dashboard
  };

  return (
    <div>
      <h1>Welcome to Crypto Wallet</h1>
      {!isMnemonicGenerated ? (
        <>
          <button onClick={handleCreateSeed}>Create Seed Phrase</button>
          <br />
          <input
            type="text"
            placeholder="Enter your mnemonic"
            value={inputMnemonic}
            onChange={handleInputMnemonic}
          />
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </>
      ) : (
        <>
          <h2>Your Mnemonic</h2>
          <table>
            <tbody>
              {generatedMnemonic.split(' ').map((word, index) => (
                <tr key={index}>
                  <td>{word}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Please note this mnemonic phrase somewhere safe.</p>
          <button onClick={handleNoteClick}>Noted</button>
        </>
      )}
    </div>
  );
}
