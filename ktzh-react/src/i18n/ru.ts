const ru: Record<string, string> = {
  /* ── App / Header ────────────────────────────── */
  appName: 'КТЖ Цифровой Двойник',
  routes: 'Маршруты',
  activeRoutes: 'Активные маршруты',
  dashboard: 'Панель управления',

  /* ── Navigation ──────────────────────────────── */
  backToRoutes: '\u2190 Назад к маршрутам',
  backToDashboard: '\u2190 Назад к панели',
  viewReplay: 'Просмотр повтора / История',

  /* ── TopBar / Header ─────────────────────────── */
  locomotive: 'Локомотив',
  routeLabel: 'Маршрут:',
  switchToLight: 'Переключить на светлую тему',
  switchToDark: 'Переключить на тёмную тему',

  /* ── Health ──────────────────────────────────── */
  systemHealthIndex: 'ИНДЕКС ЗДОРОВЬЯ СИСТЕМЫ',
  topFactors: 'ОСНОВНЫЕ ФАКТОРЫ',
  healthIndex: 'Индекс здоровья',
  healthNormal: 'Норма',
  healthCaution: 'Внимание',
  healthCritical: 'Критический',

  /* ── Health factor names (keys from data) ───── */
  engineTemp: 'Темп. двигателя',
  brakePressure: 'Давление тормозов',
  electricalSystem: 'Электросистема',

  /* ── Metric cards ────────────────────────────── */
  speed: 'СКОРОСТЬ',
  sand: 'ТОПЛИВО',
  pressure: 'ДАВЛЕНИЕ',
  temperature: 'ТЕМПЕРАТУРА',
  electrical: 'ЭЛЕКТРИКА',
  mainReservoir: 'Основной резервуар',
  brakePipe: 'Тормоз. магистраль',
  brakeCylinder: 'Тормоз. цилиндр',
  cabin: 'Кабина',
  tractionMotor: 'Тяговый двигатель',
  transformerOil: 'Трансформ. масло',
  voltage: 'Напряжение',
  current: 'Ток',
  power: 'Мощность',

  /* ── Alerts ──────────────────────────────────── */
  alerts: 'ОПОВЕЩЕНИЯ',
  noAlerts: 'Нет оповещений',

  /* ── Route map ───────────────────────────────── */
  routeMap: 'КАРТА МАРШРУТА',
  currentStation: 'ТЕКУЩАЯ',
  kmhLimit: 'км/ч лимит',
  progress: 'Прогресс',
  remaining: 'Осталось',

  /* ── Telemetry ───────────────────────────────── */
  telemetryHeading: 'ТЕЛЕМЕТРИЯ В РЕАЛЬНОМ ВРЕМЕНИ \u2014 ПОСЛЕДНИЕ 10 МИНУТ',
  chartSpeed: 'СКОРОСТЬ (км/ч)',
  chartTemp: 'ТЕМПЕРАТУРА (\u00B0C)',
  chartElectrical: 'ЭЛЕКТРИЧЕСКАЯ СИСТЕМА',

  /* ── RouteCard ───────────────────────────────── */
  departure: 'Отправление',
  completed: 'Пройдено:',

  /* ── Replay ──────────────────────────────────── */
  replay: 'Повтор / История',
  exportData: 'Экспорт данных',
  dataPoints: 'точек данных',
  backToLive: '\u2190 К прямому эфиру',
  replayTelemetry: 'ТЕЛЕМЕТРИЯ ПОВТОРА',

  /* ── Status ──────────────────────────────────── */
  loading: 'Загрузка',

  /* ── Admin ───────────────────────────────────── */
  administration: 'Администрирование',
  adminView: 'Админ',
  clientView: 'Клиент',
  fleetManagement: 'Управление парком',
  fleetManagementDesc: 'Управление инвентарём и конфигурацией локомотивов',
  alertThresholds: 'Пороги оповещений',
  alertThresholdsDesc: 'Настройка порогов параметров для оповещений',
  healthParams: 'Параметры здоровья',
  healthParamsDesc: 'Настройка весов и порогов параметров мониторинга для индекса здоровья',
  systemDiagnostics: 'Диагностика системы',
  systemDiagnosticsDesc: 'Мониторинг состояния и подключений системы',

  /* ── Fleet table ─────────────────────────────── */
  boardNumber: 'БОРТОВОЙ НОМЕР',
  typeCol: 'ТИП',
  productionDate: 'ДАТА ПРОИЗВОДСТВА',
  statusCol: 'СТАТУС',
  actionsCol: 'ДЕЙСТВИЯ',
  addLocomotive: '+ Добавить локомотив',
  searchLocomotive: 'Поиск локомотива...',
  addNewLocomotive: 'Добавить новый локомотив',
  editLocomotive: 'Редактировать локомотив',
  saveChanges: 'Сохранить',
  cancel: 'Отмена',
  save: 'Сохранить',
  electric: 'Электрический',
  diesel: 'Дизельный',
  statusActive: 'АКТИВЕН',
  statusMaintenance: 'ОБСЛУЖИВАНИЕ',
  statusRemoved: 'УДАЛЁН',

  /* ── Alert thresholds ────────────────────────── */
  selectLocomotive: 'Выбрать локомотив',
  parameter: 'Параметр',
  thresholdValues: 'Значения порогов',
  criticalLow: 'Крит. минимум',
  criticalHigh: 'Крит. максимум',
  warningLow: 'Предупр. минимум',
  warningHigh: 'Предупр. максимум',
  saveThresholds: 'Сохранить пороги',
  reset: 'Сбросить',
  thresholdPreview: 'Предпросмотр порогов',
  criticalZone: 'Критическая зона',
  warningZone: 'Зона предупреждения',
  normalZone: 'Нормальная зона',
  currentVal: 'Текущее',

  /* ── System diagnostics ──────────────────────── */
  rabbitMQQueues: 'Очереди RabbitMQ',
  mainQueue: 'Основная очередь',
  deadLetterQueue: 'Очередь мёртвых писем (DLQ)',
  messagesPerMin: 'сообщ./мин',
  messagesCount: 'сообщений',
  ingestionService: 'Сервис обработки',
  messagesPerSec: 'сообщ./сек',
  operatingNormally: 'Работает нормально',
  locomotiveConnections: 'Подключения локомотивов',
  liveNow: 'В эфире',
  noSignal: 'Нет сигнала >5 мин',
  underMaintenance: 'На обслуживании',
  signalLostMin: 'Сигнал потерян',
};

export default ru;
