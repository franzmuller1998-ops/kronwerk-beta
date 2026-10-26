/**
 * KRONWERK music — приём заявок в Google Таблицу.
 *
 * Установка (один раз):
 *   1. Создайте Google Таблицу. Меню «Расширения → Apps Script».
 *   2. Замените весь код в редакторе содержимым этого файла.
 *   3. В строке TOKEN вставьте значение APPLY_SHEET_TOKEN из файла .env.local сайта.
 *   4. «Начать развертывание → Новое развертывание», тип «Веб-приложение»:
 *        Выполнять как: «Я»; У кого есть доступ: «Все».
 *      Разрешите доступ к таблице, когда Google спросит.
 *   5. Скопируйте URL веб-приложения (…/exec) в APPLY_SHEET_URL в .env.local сайта.
 *
 * Сайт отправляет заявку POST-запросом с токеном; без верного токена строка не добавляется.
 */

const TOKEN = 'ВСТАВЬТЕ_СЮДА_APPLY_SHEET_TOKEN'
const SHEET_NAME = 'Заявки'
const HEADERS = ['Дата', 'Имя / псевдоним', 'Email / Telegram', 'Ссылки на треки', 'Возраст', 'Чужие семплы', 'Какие семплы и откуда', 'ID']

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000) // заявки, пришедшие одновременно, не перезапишут друг друга
  try {
    const data = JSON.parse(e.postData.contents)
    if (!TOKEN || data.token !== TOKEN) return json({ ok: false, error: 'forbidden' })

    const book = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.setFrozenRows(1)
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    }
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
    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

// Текст, начинающийся с = + - @, Таблица приняла бы за формулу: экранируем апострофом.
function safe(v) {
  const s = v == null ? '' : String(v)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)
}
