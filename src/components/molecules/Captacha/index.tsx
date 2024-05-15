import React, { useState } from 'react';

const SimpleCaptcha = () => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userInput, setUserInput] = useState('');
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  function generateCaptcha() {
    // Generate a random 4-digit number as a simple CAPTCHA
    return Math.floor(1000 + Math.random() * 9000);
  }

  const handleChange = (e: any) => {
    const input = e.target.value;
    setUserInput(input);

    // Check if the user's input matches the CAPTCHA
    setIsCaptchaValid(input === captcha.toString());
  };

  const refreshCaptcha = () => {
    // Generate a new CAPTCHA and reset user input
    setCaptcha(generateCaptcha());
    setUserInput('');
    setIsCaptchaValid(false);
  };

  return (
    <div>
      <h2>Simple CAPTCHA</h2>
      <p>Enter the following CAPTCHA:</p>
      <div>
        <span>{captcha}</span>
        <button onClick={refreshCaptcha}>Refresh</button>
      </div>
      <input
        type="text"
        placeholder="Enter CAPTCHA"
        value={userInput}
        onChange={handleChange}
      />
      {isCaptchaValid ? (
        <p style={{ color: 'green' }}>CAPTCHA is valid!</p>
      ) : null}
    </div>
  );
};

export default SimpleCaptcha;





