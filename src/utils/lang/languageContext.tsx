import { useRouter } from 'next/router';
import { createContext, ReactNode, useContext, useState } from 'react';

interface LangContextI {
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
}

export type Language = 'en' | 'ko';

// language context
const LangContext = createContext<LangContextI>({ lang: 'en' } as LangContextI);

// language provider
export const LangProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [lang, setLang] = useState<Language>(router.locale as Language);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLanguage = () => useContext(LangContext);
