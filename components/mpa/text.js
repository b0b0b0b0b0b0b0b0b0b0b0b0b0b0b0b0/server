const TEXT = {
  ru: {
    sideTitle: 'Один аккаунт на всех сервисах',
    sideLead: 'Вошёл здесь — и ты уже свой на modrinth.black и всех его сайтах.',
    perks: [
      { title: 'Везде один ник', text: 'Ник и аватар одинаковые на modrinth.black, клиенте, перепаке, переводе плагинов и других сервисах.' },
      { title: 'Вход один раз', text: 'Вошёл на одном сайте — на остальных ты тоже в аккаунте. Вышел — вышел везде.' },
      { title: 'Избранное и история', text: 'Избранные моды и история скачиваний живут на modrinth.black и всегда под рукой.' },
    ],
    loginTitle: 'С возвращением',
    loginLead: 'Войди, чтобы всё твоё было под рукой.',
    registerTitle: 'Создай аккаунт',
    registerLead: 'Полминуты — и без почты.',
    username: 'Ник',
    usernamePlaceholder: 'например, steve_2026',
    usernameHint: '3–24 символа: латиница, цифры и _',
    password: 'Пароль',
    passwordPlaceholder: 'твой пароль',
    newPasswordPlaceholder: 'придумай пароль',
    showPassword: 'Показать пароль',
    hidePassword: 'Скрыть пароль',
    passwordHint: 'от 8 символов',
    strength: ['', 'Слабый', 'Так себе', 'Хороший', 'Надёжный'],
    submitLogin: 'Войти',
    submitRegister: 'Создать аккаунт',
    noRecovery: 'Почту мы не спрашиваем, поэтому восстановить пароль нельзя — сохрани его.',
    noAccount: 'Ещё нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    switchRegister: 'Создать',
    switchLogin: 'Войти',
    petKitten: 'Погладить котика',
    accountTitle: 'Твой аккаунт',
    accountLead: 'Один на modrinth.black и всех его сервисах.',
    nickname: 'Ник',
    save: 'Сохранить',
    saved: 'Ник обновлён на всех сайтах',
    security: 'Пароль и привязки',
    securityText: 'Пароль, GitHub и Telegram меняются на modrinth.black.',
    securityLink: 'Открыть настройки',
    logout: 'Выйти из аккаунта',
    logoutText: 'Выход сработает сразу на всех сайтах.',
    signedOutTitle: 'Ты не вошёл',
    signedOutLead: 'Войди или создай аккаунт — он один на все сервисы.',
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
    sideTitle: 'One account for every service',
    sideLead: 'Sign in here and you are signed in on modrinth.black and all its sites.',
    perks: [
      { title: 'Same name everywhere', text: 'Your username and avatar are the same on modrinth.black, the client, repacker, plugin translator and other services.' },
      { title: 'Sign in once', text: 'Signed in on one site — you are signed in on the others. Signed out — signed out everywhere.' },
      { title: 'Favorites and history', text: 'Favorite mods and download history live on modrinth.black, always at hand.' },
    ],
    loginTitle: 'Welcome back',
    loginLead: 'Sign in to keep everything at hand.',
    registerTitle: 'Create an account',
    registerLead: 'Half a minute, no email needed.',
    username: 'Username',
    usernamePlaceholder: 'e.g. steve_2026',
    usernameHint: '3–24 characters: latin letters, digits and _',
    password: 'Password',
    passwordPlaceholder: 'your password',
    newPasswordPlaceholder: 'make up a password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordHint: '8+ characters',
    strength: ['', 'Weak', 'So-so', 'Good', 'Strong'],
    submitLogin: 'Sign in',
    submitRegister: 'Create account',
    noRecovery: 'We do not ask for email, so the password cannot be recovered — keep it safe.',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    switchRegister: 'Create one',
    switchLogin: 'Sign in',
    petKitten: 'Pet the kitten',
    accountTitle: 'Your account',
    accountLead: 'One for modrinth.black and all its services.',
    nickname: 'Username',
    save: 'Save',
    saved: 'Username updated on every site',
    security: 'Password and links',
    securityText: 'Password, GitHub and Telegram are managed on modrinth.black.',
    securityLink: 'Open settings',
    logout: 'Sign out',
    logoutText: 'You will be signed out on every site at once.',
    signedOutTitle: 'You are not signed in',
    signedOutLead: 'Sign in or create an account — one for every service.',
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

export function passwordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-zа-яё]/.test(password) && /[A-ZА-ЯЁ]/.test(password)) score += 1
  if (/\d/.test(password) && /[^\dA-Za-zА-Яа-яЁё]/.test(password)) score += 1
  return Math.max(1, score)
}
