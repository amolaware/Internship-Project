import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Signup from './Signup';
import Signin from './Signin';
import './AuthPage.css'

function AuthPage() {
  const [activeForm, setActiveForm] = useState(null); 
  const [formVisible, setFormVisible] = useState(false); 
  const navigate = useNavigate(); 

  const handleButtonClick = (formType) => {
    setActiveForm(formType); 
    setFormVisible(true); 
  };

  
  const handleGoBack = () => {
    setActiveForm(null); 
    setFormVisible(false); 
  };

  return (
    <div className="auth-page">
      

      
      {!formVisible && (
        <div className="auth-buttons" id='btn'>
          <button onClick={() => handleButtonClick('signup')}>Signup</button>
          <button onClick={() => handleButtonClick('signin')}>Signin</button>
        </div>
      )}

      
      {activeForm === 'signup' && <Signup />}
      {activeForm === 'signin' && <Signin />}

      
      {formVisible && (
        <div>
          <button onClick={handleGoBack} className="go-back-button">
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthPage;
