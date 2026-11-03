const TEXT = {
  ru: {
    login: 'Вход',
    register: 'Регистрация',
    username: 'Ник',
    password: 'Пароль',
    signIn: 'Войти',
    signUp: 'Создать аккаунт',
    working: 'Секунду…',
    oneAccount: 'Один аккаунт на modrinth.black и всех его сервисах',
    account: 'Аккаунт',
    nickname: 'Ник',
    save: 'Сохранить',
    saved: 'Сохранено',
    logout: 'Выйти',
    security: 'Пароль, привязки GitHub и Telegram',
    securityLink: 'Настроить на modrinth.black',
    signedOut: 'Ты не вошёл в аккаунт',
    back: 'На главную',
    errors: {
      invalid: 'Неверный ник или пароль',
      captcha: 'Проверка не прошла, попробуй ещё раз',
      rate_limit: 'Слишком много попыток, подожди немного',
      signup_limit: 'С этой сети недавно регистрировались, попробуй позже',
      taken: 'Такой ник уже занят',
      username: 'Ник: 3–24 символа, латиница, цифры и _',
      password: 'Пароль: от 8 до 128 символов',
      unauthorized: 'Сессия закончилась, войди заново',
      forbidden: 'Запрос отклонён, обнови страницу',
      unavailable: 'Сервер аккаунтов не отвечает, попробуй позже',
    },
  },
  en: {
    login: 'Sign in',
    register: 'Sign up',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    working: 'One moment…',
    oneAccount: 'One account for modrinth.black and all its services',
    account: 'Account',
    nickname: 'Username',
    save: 'Save',
    saved: 'Saved',
    logout: 'Sign out',
    security: 'Password, GitHub and Telegram links',
    securityLink: 'Manage on modrinth.black',
    signedOut: 'You are not signed in',
    back: 'Home',
    errors: {
      invalid: 'Wrong username or password',
      captcha: 'Check failed, try again',
      rate_limit: 'Too many attempts, wait a bit',
      signup_limit: 'Someone signed up from this network recently, try later',
      taken: 'This username is taken',
      username: 'Username: 3–24 characters, latin letters, digits and _',
      password: 'Password: 8 to 128 characters',
      unauthorized: 'Session expired, sign in again',
      forbidden: 'Request rejected, reload the page',
      unavailable: 'Account server is not responding, try later',
    },
  },
}

export function getText() {
  if (typeof document === 'undefined') return TEXT.ru
  const lang = (document.documentElement.lang || 'ru').toLowerCase()
  return lang.startsWith('ru') || lang.startsWith('uk') ? TEXT.ru : TEXT.en
}

export function errorText(text, code) {
  return text.errors[code] || text.errors.unavailable
}
