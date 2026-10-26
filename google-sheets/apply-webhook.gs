/**
 * KRONWERK music — заявки артистов и запись гостей на мероприятия в Google Таблицу.
 *
 * Установка (один раз):
 *   1. Создайте Google Таблицу. Меню «Расширения → Apps Script».
 *   2. Замените весь код в редакторе содержимым этого файла.
 *   3. В строке TOKEN вставьте значение APPLY_SHEET_TOKEN из файла .env.local сайта.
 *   4. Выберите функцию authorize в списке над кодом и нажмите «Выполнить»: Google попросит разрешить
 *      доступ к таблице и отправку писем (письма-подтверждения уходят с вашего Gmail).
 *   5. «Начать развертывание → Новое развертывание», тип «Веб-приложение»:
 *        Выполнять как: «Я»; У кого есть доступ: «Все».
 *   6. Скопируйте URL веб-приложения (…/exec) в APPLY_SHEET_URL в .env.local сайта.
 *
 * После изменения кода: «Начать развертывание → Управление развертываниями → ✎ → Новая версия»,
 * иначе Google продолжит выполнять старый код.
 *
 * Сайт отправляет POST-запросы с токеном; без верного токена ничего не записывается.
 *   без action      — заявка артиста, строка на листе «Заявки»
 *   action=register — запись гостя: проверка мест, номер брони, письмо, строка на листе «Регистрации»
 *   action=seats    — сколько мест занято на каждом мероприятии
 */

const TOKEN = 'ВСТАВЬТЕ_СЮДА_APPLY_SHEET_TOKEN'
const SHEET_NAME = 'Заявки'
const HEADERS = ['Дата', 'Имя / псевдоним', 'Email / Telegram', 'Ссылки на треки', 'Возраст', 'Чужие семплы', 'Какие семплы и откуда', 'ID']
const REG_SHEET = 'Регистрации'
const REG_HEADERS = ['Дата записи', 'Мероприятие', 'Дата', 'Город', 'Имя', 'Email', 'Телефон / Telegram', 'Гостей', 'Номер брони', 'ID мероприятия']
const REG = { email: 5, guests: 7, code: 8, event: 9 } // индексы столбцов (с нуля) в REG_HEADERS
const REPLY_TO = 'kronwerk.music.spb@gmail.com'

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000) // запросы, пришедшие одновременно, не перезапишут друг друга и не займут одно место дважды
  try {
    const data = JSON.parse(e.postData.contents)
    // Запись и места приходят с полем auth, а не token: старая версия скрипта отклонит их, а не запишет
    // в «Заявки», если сайт обновили раньше, чем скрипт.
    if (!TOKEN || (data.token || data.auth) !== TOKEN) return json({ ok: false, error: 'forbidden' })
    if (data.action === 'register') return json(register(data))
    if (data.action === 'seats') return json({ ok: true, taken: takenSeats() })
    return json(apply(data))
  } catch (err) {
    return json({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

function apply(data) {
  const sheet = sheetWith(SHEET_NAME, HEADERS)
  sheet.appendRow([
    new Date(data.receivedAt),
    safe(data.artist),
    safe(data.email),
    safe((data.links || []).join('\n')),
    Number(data.age) || safe(data.age),
    safe(data.samplesLabel),
    safe(data.samplesInfo),
    safe(data.id),
  ])
  return { ok: true }
}

function register(data) {
  const ev = data.event || {}
  const guests = Math.max(1, Math.min(4, Number(data.guests) || 1))
  const email = String(data.email || '').trim().toLowerCase()
  const sheet = sheetWith(REG_SHEET, REG_HEADERS)
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, REG_HEADERS.length).getValues() : []

  // Повторная запись того же email: не занимаем места ещё раз, а повторно отправляем письмо с тем же номером.
  const same = rows.find((r) => r[REG.event] === ev.slug && String(r[REG.email]).toLowerCase() === email)
  if (same) {
    const mailed = confirm(email, data.name, ev, same[REG.code], same[REG.guests])
    return { ok: true, code: same[REG.code], guests: same[REG.guests], repeat: true, mailed: mailed }
  }

  let taken = 0
  rows.forEach((r) => { if (r[REG.event] === ev.slug) taken += Number(r[REG.guests]) || 0 })
  const left = Number(ev.capacity) - taken
  if (guests > left) return { ok: false, error: 'full', left: Math.max(0, left) }

  const codes = {}
  rows.forEach((r) => { codes[r[REG.code]] = true })
  let code
  do { code = 'KW-' + Math.floor(1000 + Math.random() * 9000) } while (codes[code])

  sheet.appendRow([new Date(), safe(ev.title), safe(ev.date), safe(ev.city), safe(data.name), safe(email), safe(data.phone), guests, code, ev.slug])
  const mailed = confirm(email, data.name, ev, code, guests)
  return { ok: true, code: code, guests: guests, left: left - guests, mailed: mailed }
}

function takenSeats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REG_SHEET)
  const taken = {}
  if (!sheet || sheet.getLastRow() < 2) return taken
  sheet.getRange(2, 1, sheet.getLastRow() - 1, REG_HEADERS.length).getValues().forEach((r) => {
    taken[r[REG.event]] = (taken[r[REG.event]] || 0) + (Number(r[REG.guests]) || 0)
  })
  return taken
}

// Письмо-подтверждение гостю. Ошибка отправки (например, исчерпан дневной лимит Gmail) не отменяет запись.
function confirm(email, name, ev, code, guests) {
  const lines = [
    'Здравствуйте, ' + name + '!',
    '',
    'Вы записаны на «' + ev.title + '» — ' + ev.city + ', ' + ev.date + '.',
    'Время: ' + (ev.time || 'уточняется') + '. Адрес: ' + (ev.address || 'уточняется') + '.',
    '',
    'Номер брони: ' + code,
    'Гостей: ' + guests,
    '',
    'Оплата на входе. Назовите номер брони или покажите это письмо.',
    'Если планы изменились, просто ответьте на это письмо — мы освободим место.',
    '',
    'До встречи!',
    'KRONWERK music',
  ]
  try {
    MailApp.sendEmail({ to: email, subject: 'Запись на «' + ev.title + '» ' + ev.date + ' — ' + code, body: lines.join('\n'), name: 'KRONWERK music', replyTo: REPLY_TO })
    return true
  } catch (err) {
    console.error('Письмо не отправлено', email, err)
    return false
  }
}

function sheetWith(name, headers) {
  const book = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = book.getSheetByName(name) || book.insertSheet(name)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers)
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
  }
  return sheet
}

// Запустите один раз из редактора: Google запросит разрешения на таблицу и отправку писем.
function authorize() {
  SpreadsheetApp.getActiveSpreadsheet()
  console.log('Писем можно отправить сегодня: ' + MailApp.getRemainingDailyQuota())
}

// Текст, начинающийся с = + - @, Таблица приняла бы за формулу: экранируем апострофом.
function safe(v) {
  const s = v == null ? '' : String(v)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
