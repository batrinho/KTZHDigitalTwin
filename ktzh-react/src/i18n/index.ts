import en from './en';
import ru from './ru';

export type Locale = 'en' | 'ru';

export const translations: Record<Locale, Record<string, string>> = { en, ru };
