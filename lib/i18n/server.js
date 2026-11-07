import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, format, isLocale, lookup } from './locales'
import ru from './messages/ru.json'
import orv from './messages/orv.json'
import en from './messages/en.json'
import de from './messages/de.json'
import it from './messages/it.json'
import fr from './messages/fr.json'
import es from './messages/es.json'
import pt from './messages/pt.json'
import pl from './messages/pl.json'
import uk from './messages/uk.json'
import lv from './messages/lv.json'
import sv from './messages/sv.json'
import zh from './messages/zh.json'
import ja from './messages/ja.json'
import vi from './messages/vi.json'

const MESSAGES = { ru, orv, en, de, it, fr, es, pt, pl, uk, lv, sv, zh, ja, vi }

export async function getLocale() {
  try {
    const value = (await cookies()).get(LOCALE_COOKIE)?.value
    return isLocale(value) ? value : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function getMessages(locale) {
  return MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE]
}

export async function getServerT() {
  const locale = await getLocale()
  const messages = getMessages(locale)
  return {
    locale,
    messages,
    t: (key, vars) => {
      const value = lookup(messages, key)
      return format(value === undefined ? lookup(MESSAGES[DEFAULT_LOCALE], key) ?? key : value, vars)
    },
  }
}
