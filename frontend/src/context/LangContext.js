import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'te' : 'en');

  const t = (enText, teText) => lang === 'te' && teText ? teText : enText;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
