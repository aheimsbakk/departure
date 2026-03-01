// translations.js — static string data for all supported languages
// Keys are grouped by UI concern (comments only, no runtime logic here).

const translations = {
  en: {
    // Options panel
    stationName: 'Station or stop name',
    numberOfDepartures: 'Number of departures',
    fetchInterval: 'Fetch interval (seconds)',
    textSize: 'Text size',
    transportModes: 'Transport modes (filter)',
    switchLanguage: 'Switch language',
    save: 'Save to Favorites',
    close: 'Close',

    // Tooltips
    stationNameTooltip: 'Click to show your saved favorites',
    settingsTooltip: 'Open settings panel',
    themeTooltip: 'Change theme',
    shareBoard: 'Copy link to clipboard',
    noStationToShare: 'No station selected to share',
    shareFailed: 'Failed to create share link',

    // Text sizes
    tiny: 'Tiny',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    extraLarge: 'Extra large',

    // Transport modes
    bus: 'Bus',
    tram: 'Tram',
    metro: 'Metro',
    rail: 'Rail',
    water: 'Water',
    coach: 'Coach',

    // Toast messages
    settingsApplied: 'Settings applied',
    filtersUpdated: 'Filters updated',
    textSizeUpdated: 'Text size updated',
    savedToFavorites: 'Saved to favorites',
    languageChanged: 'Language changed',

    // Update toast
    newVersionAvailable: 'New version available, reloading...',
    upgradingFrom: 'Upgrading from',
    to: 'to',

    // Status
    updatingIn: 'Updating in',
    seconds: 's',
    now: 'Now',
    live: 'Live',
    error: 'Error',
    noDepartures: 'No departures...',

    // Footer
    dataFrom: 'Data from',
    version: 'Version',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'No station selected',
    noRecentStations: 'No recent stations',

    // Favorite button
    saveToFavorites: 'Save to favorites',
    alreadyInFavorites: 'Already in favorites',

    // Transport mode toggle
    toggleAllModes: 'Toggle all transport modes'
  },

  no: {
    // Options panel
    stationName: 'Stasjons- eller holdeplassnavn',
    numberOfDepartures: 'Antall avganger',
    fetchInterval: 'Oppdateringsintervall (sekunder)',
    textSize: 'Tekststørrelse',
    transportModes: 'Transportmidler (filter)',
    switchLanguage: 'Bytt språk',
    apply: 'Bruk',
    save: 'Lagre i favoritter',
    close: 'Lukk',

    // Tooltips
    stationNameTooltip: 'Klikk for å vise dine lagrede favoritter',
    settingsTooltip: 'Åpne innstillinger',
    themeTooltip: 'Bytt tema',
    shareBoard: 'Kopier lenke til utklippstavle',
    noStationToShare: 'Ingen stasjon valgt å dele',
    shareFailed: 'Kunne ikke lage delingslenke',

    // Text sizes
    tiny: 'Veldig liten',
    small: 'Liten',
    medium: 'Middels',
    large: 'Stor',
    extraLarge: 'Ekstra stor',

    // Transport modes
    bus: 'Buss',
    tram: 'Trikk',
    metro: 'T-bane',
    rail: 'Tog',
    water: 'Båt',
    coach: 'Ekspressbuss',

    // Toast messages
    settingsApplied: 'Innstillinger lagret',
    filtersUpdated: 'Filter oppdatert',
    textSizeUpdated: 'Tekststørrelse oppdatert',
    savedToFavorites: 'Lagret i favoritter',
    languageChanged: 'Språk endret',

    // Update toast
    newVersionAvailable: 'Ny versjon tilgjengelig, laster inn på nytt...',
    upgradingFrom: 'Oppgraderer fra',
    to: 'til',

    // Status
    updatingIn: 'Oppdaterer om',
    seconds: 's',
    now: 'Nå',
    live: 'Direkte',
    error: 'Feil',
    noDepartures: 'Ingen avganger...',

    // Footer
    dataFrom: 'Data fra',
    version: 'Versjon',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Ingen stasjon valgt',
    noRecentStations: 'Ingen nylige stasjoner',

    // Favorite button
    saveToFavorites: 'Lagre i favoritter',
    alreadyInFavorites: 'Allerede i favoritter',

    // Transport mode toggle
    toggleAllModes: 'Velg/fjern alle transportmidler'
  },

  de: {
    // Options panel
    stationName: 'Bahnhofs- oder Haltestellenname',
    numberOfDepartures: 'Anzahl Abfahrten',
    fetchInterval: 'Aktualisierungsintervall (Sekunden)',
    textSize: 'Textgröße',
    transportModes: 'Verkehrsmittel (Filter)',
    switchLanguage: 'Sprache wechseln',
    apply: 'Anwenden',
    save: 'In Favoriten speichern',
    close: 'Schließen',

    // Tooltips
    stationNameTooltip: 'Klicken, um Ihre gespeicherten Favoriten anzuzeigen',
    settingsTooltip: 'Einstellungen öffnen',
    themeTooltip: 'Thema ändern',
    shareBoard: 'Link in Zwischenablage kopieren',
    noStationToShare: 'Keine Station zum Teilen ausgewählt',
    shareFailed: 'Fehler beim Erstellen des Freigabelinks',

    // Text sizes
    tiny: 'Sehr klein',
    small: 'Klein',
    medium: 'Mittel',
    large: 'Groß',
    extraLarge: 'Extra groß',

    // Transport modes
    bus: 'Bus',
    tram: 'Straßenbahn',
    metro: 'U-Bahn',
    rail: 'Zug',
    water: 'Schiff',
    coach: 'Reisebus',

    // Toast messages
    settingsApplied: 'Einstellungen gespeichert',
    filtersUpdated: 'Filter aktualisiert',
    textSizeUpdated: 'Textgröße aktualisiert',
    savedToFavorites: 'In Favoriten gespeichert',
    languageChanged: 'Sprache geändert',

    // Update toast
    newVersionAvailable: 'Neue Version verfügbar, wird neu geladen...',
    upgradingFrom: 'Aktualisierung von',
    to: 'auf',

    // Status
    updatingIn: 'Aktualisierung in',
    seconds: 's',
    now: 'Jetzt',
    live: 'Live',
    error: 'Fehler',
    noDepartures: 'Keine Abfahrten...',

    // Footer
    dataFrom: 'Daten von',
    version: 'Version',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Keine Station ausgewählt',
    noRecentStations: 'Keine letzten Stationen',

    // Favorite button
    saveToFavorites: 'In Favoriten speichern',
    alreadyInFavorites: 'Bereits in Favoriten',

    // Transport mode toggle
    toggleAllModes: 'Alle Verkehrsmittel auswählen/abwählen'
  },

  es: {
    // Options panel
    stationName: 'Nombre de estación o parada',
    numberOfDepartures: 'Número de salidas',
    fetchInterval: 'Intervalo de actualización (segundos)',
    textSize: 'Tamaño del texto',
    transportModes: 'Modos de transporte (filtro)',
    switchLanguage: 'Cambiar idioma',
    apply: 'Aplicar',
    save: 'Guardar en favoritos',
    close: 'Cerrar',

    // Tooltips
    stationNameTooltip: 'Haz clic para ver tus favoritos guardados',
    settingsTooltip: 'Abrir panel de configuración',
    themeTooltip: 'Cambiar tema',
    shareBoard: 'Copiar enlace al portapapeles',
    noStationToShare: 'No hay estación seleccionada para compartir',
    shareFailed: 'Error al crear el enlace',

    // Text sizes
    tiny: 'Muy pequeño',
    small: 'Pequeño',
    medium: 'Mediano',
    large: 'Grande',
    extraLarge: 'Extra grande',

    // Transport modes
    bus: 'Autobús',
    tram: 'Tranvía',
    metro: 'Metro',
    rail: 'Tren',
    water: 'Barco',
    coach: 'Autocar',

    // Toast messages
    settingsApplied: 'Configuración aplicada',
    filtersUpdated: 'Filtros actualizados',
    textSizeUpdated: 'Tamaño de texto actualizado',
    savedToFavorites: 'Guardado en favoritos',
    languageChanged: 'Idioma cambiado',

    // Update toast
    newVersionAvailable: 'Nueva versión disponible, recargando...',
    upgradingFrom: 'Actualizando desde',
    to: 'a',

    // Status
    updatingIn: 'Actualizando en',
    seconds: 's',
    now: 'Ahora',
    live: 'En vivo',
    error: 'Error',
    noDepartures: 'Sin salidas...',

    // Footer
    dataFrom: 'Datos de',
    version: 'Versión',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Ninguna estación seleccionada',
    noRecentStations: 'No hay estaciones recientes',

    // Favorite button
    saveToFavorites: 'Guardar en favoritos',
    alreadyInFavorites: 'Ya en favoritos',

    // Transport mode toggle
    toggleAllModes: 'Seleccionar/deseleccionar todos los modos'
  },

  it: {
    // Options panel
    stationName: 'Nome stazione o fermata',
    numberOfDepartures: 'Numero di partenze',
    fetchInterval: 'Intervallo di aggiornamento (secondi)',
    textSize: 'Dimensione testo',
    transportModes: 'Mezzi di trasporto (filtro)',
    switchLanguage: 'Cambia lingua',
    apply: 'Applica',
    save: 'Salva nei preferiti',
    close: 'Chiudi',

    // Tooltips
    stationNameTooltip: 'Clicca per mostrare i tuoi preferiti salvati',
    settingsTooltip: 'Apri pannello impostazioni',
    themeTooltip: 'Cambia tema',
    shareBoard: 'Condividi questa bacheca',
    noStationToShare: 'Nessuna stazione selezionata da condividere',
    shareFailed: 'Impossibile creare il link',

    // Text sizes
    tiny: 'Piccolissimo',
    small: 'Piccolo',
    medium: 'Medio',
    large: 'Grande',
    extraLarge: 'Extra grande',

    // Transport modes
    bus: 'Autobus',
    tram: 'Tram',
    metro: 'Metropolitana',
    rail: 'Treno',
    water: 'Nave',
    coach: 'Pullman',

    // Toast messages
    settingsApplied: 'Impostazioni applicate',
    filtersUpdated: 'Filtri aggiornati',
    textSizeUpdated: 'Dimensione testo aggiornata',
    savedToFavorites: 'Salvato nei preferiti',
    languageChanged: 'Lingua cambiata',

    // Update toast
    newVersionAvailable: 'Nuova versione disponibile, ricaricamento...',
    upgradingFrom: 'Aggiornamento da',
    to: 'a',

    // Status
    updatingIn: 'Aggiornamento tra',
    seconds: 's',
    now: 'Adesso',
    live: 'Dal vivo',
    error: 'Errore',
    noDepartures: 'Nessuna partenza...',

    // Footer
    dataFrom: 'Dati da',
    version: 'Versione',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Nessuna stazione selezionata',
    noRecentStations: 'Nessuna stazione recente',

    // Favorite button
    saveToFavorites: 'Salva nei preferiti',
    alreadyInFavorites: 'Già nei preferiti',

    // Transport mode toggle
    toggleAllModes: 'Seleziona/deseleziona tutti i mezzi'
  },

  el: {
    // Options panel
    stationName: 'Όνομα σταθμού ή στάσης',
    numberOfDepartures: 'Αριθμός αναχωρήσεων',
    fetchInterval: 'Διάστημα ενημέρωσης (δευτερόλεπτα)',
    textSize: 'Μέγεθος κειμένου',
    transportModes: 'Μέσα μεταφοράς (φίλτρο)',
    switchLanguage: 'Αλλαγή γλώσσας',
    apply: 'Εφαρμογή',
    save: 'Αποθήκευση στα αγαπημένα',
    close: 'Κλείσιμο',

    // Tooltips
    stationNameTooltip: 'Κάντε κλικ για να δείτε τα αποθηκευμένα αγαπημένα σας',
    settingsTooltip: 'Άνοιγμα πίνακα ρυθμίσεων',
    themeTooltip: 'Αλλαγή θέματος',
    shareBoard: 'Κοινοποίηση αυτού του πίνακα',
    noStationToShare: 'Δεν επιλέχθηκε σταθμός για κοινοποίηση',
    shareFailed: 'Αποτυχία δημιουργίας συνδέσμου',

    // Text sizes
    tiny: 'Πολύ μικρό',
    small: 'Μικρό',
    medium: 'Μεσαίο',
    large: 'Μεγάλο',
    extraLarge: 'Πολύ μεγάλο',

    // Transport modes
    bus: 'Λεωφορείο',
    tram: 'Τραμ',
    metro: 'Μετρό',
    rail: 'Τρένο',
    water: 'Πλοίο',
    coach: 'Πούλμαν',

    // Toast messages
    settingsApplied: 'Οι ρυθμίσεις εφαρμόστηκαν',
    filtersUpdated: 'Τα φίλτρα ενημερώθηκαν',
    textSizeUpdated: 'Το μέγεθος κειμένου ενημερώθηκε',
    savedToFavorites: 'Αποθηκεύτηκε στα αγαπημένα',
    languageChanged: 'Η γλώσσα άλλαξε',

    // Update toast
    newVersionAvailable: 'Διαθέσιμη νέα έκδοση, επαναφόρτωση...',
    upgradingFrom: 'Αναβάθμιση από',
    to: 'σε',

    // Status
    updatingIn: 'Ενημέρωση σε',
    seconds: 'δ',
    now: 'Τώρα',
    live: 'Ζωντανά',
    error: 'Σφάλμα',
    noDepartures: 'Δεν υπάρχουν αναχωρήσεις...',

    // Footer
    dataFrom: 'Δεδομένα από',
    version: 'Έκδοση',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Δεν επιλέχθηκε σταθμός',
    noRecentStations: 'Δεν υπάρχουν πρόσφατοι σταθμοί',

    // Favorite button
    saveToFavorites: 'Αποθήκευση στα αγαπημένα',
    alreadyInFavorites: 'Ήδη στα αγαπημένα',

    // Transport mode toggle
    toggleAllModes: 'Επιλογή/αποεπιλογή όλων των μέσων'
  },

  fa: {
    // Options panel
    stationName: 'نام ایستگاه یا توقفگاه',
    numberOfDepartures: 'تعداد حرکت‌ها',
    fetchInterval: 'فاصله به‌روزرسانی (ثانیه)',
    textSize: 'اندازه متن',
    transportModes: 'وسایل نقلیه (فیلتر)',
    switchLanguage: 'تغییر زبان',
    apply: 'اعمال',
    save: 'ذخیره در علاقه‌مندی‌ها',
    close: 'بستن',

    // Tooltips
    stationNameTooltip: 'برای نمایش علاقه‌مندی‌های ذخیره شده کلیک کنید',
    settingsTooltip: 'باز کردن پنل تنظیمات',
    themeTooltip: 'تغییر تم',
    shareBoard: 'اشتراک‌گذاری این تابلو',
    noStationToShare: 'هیچ ایستگاهی برای اشتراک‌گذاری انتخاب نشده',
    shareFailed: 'ایجاد لینک اشتراک‌گذاری ناموفق بود',

    // Text sizes
    tiny: 'خیلی کوچک',
    small: 'کوچک',
    medium: 'متوسط',
    large: 'بزرگ',
    extraLarge: 'خیلی بزرگ',

    // Transport modes
    bus: 'اتوبوس',
    tram: 'تراموا',
    metro: 'مترو',
    rail: 'قطار',
    water: 'کشتی',
    coach: 'اتوبوس بین‌شهری',

    // Toast messages
    settingsApplied: 'تنظیمات اعمال شد',
    filtersUpdated: 'فیلترها به‌روزرسانی شد',
    textSizeUpdated: 'اندازه متن به‌روزرسانی شد',
    savedToFavorites: 'در علاقه‌مندی‌ها ذخیره شد',
    languageChanged: 'زبان تغییر کرد',

    // Update toast
    newVersionAvailable: 'نسخه جدید موجود است، در حال بارگذاری مجدد...',
    upgradingFrom: 'ارتقا از',
    to: 'به',

    // Status
    updatingIn: 'به‌روزرسانی در',
    seconds: 'ث',
    now: 'اکنون',
    live: 'زنده',
    error: 'خطا',
    noDepartures: 'حرکتی وجود ندارد...',

    // Footer
    dataFrom: 'داده‌ها از',
    version: 'نسخه',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'هیچ ایستگاهی انتخاب نشده',
    noRecentStations: 'ایستگاه اخیر وجود ندارد',

    // Favorite button
    saveToFavorites: 'ذخیره در علاقه‌مندی‌ها',
    alreadyInFavorites: 'قبلاً در علاقه‌مندی‌ها',

    // Transport mode toggle
    toggleAllModes: 'انتخاب/عدم انتخاب همه وسایل نقلیه'
  },

  hi: {
    // Options panel
    stationName: 'स्टेशन या पड़ाव का नाम',
    numberOfDepartures: 'प्रस्थान की संख्या',
    fetchInterval: 'अपडेट अंतराल (सेकंड)',
    textSize: 'पाठ का आकार',
    transportModes: 'परिवहन साधन (फ़िल्टर)',
    switchLanguage: 'भाषा बदलें',
    apply: 'लागू करें',
    save: 'पसंदीदा में सहेजें',
    close: 'बंद करें',

    // Tooltips
    stationNameTooltip: 'अपने सहेजे गए पसंदीदा दिखाने के लिए क्लिक करें',
    settingsTooltip: 'सेटिंग पैनल खोलें',
    themeTooltip: 'थीम बदलें',
    shareBoard: 'इस बोर्ड को साझा करें',
    noStationToShare: 'साझा करने के लिए कोई स्टेशन नहीं चुना गया',
    shareFailed: 'शेयर लिंक बनाने में विफल',

    // Text sizes
    tiny: 'बहुत छोटा',
    small: 'छोटा',
    medium: 'मध्यम',
    large: 'बड़ा',
    extraLarge: 'बहुत बड़ा',

    // Transport modes
    bus: 'बस',
    tram: 'ट्राम',
    metro: 'मेट्रो',
    rail: 'रेल',
    water: 'जलयान',
    coach: 'कोच',

    // Toast messages
    settingsApplied: 'सेटिंग्स लागू की गईं',
    filtersUpdated: 'फ़िल्टर अपडेट किए गए',
    textSizeUpdated: 'पाठ का आकार अपडेट किया गया',
    savedToFavorites: 'पसंदीदा में सहेजा गया',
    languageChanged: 'भाषा बदली गई',

    // Update toast
    newVersionAvailable: 'नया संस्करण उपलब्ध है, फिर से लोड किया जा रहा है...',
    upgradingFrom: 'से अपग्रेड किया जा रहा है',
    to: 'को',

    // Status
    updatingIn: 'अपडेट में',
    seconds: 'से',
    now: 'अभी',
    live: 'लाइव',
    error: 'त्रुटि',
    noDepartures: 'कोई प्रस्थान नहीं...',

    // Footer
    dataFrom: 'डेटा स्रोत',
    version: 'संस्करण',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'कोई स्टेशन चयनित नहीं',
    noRecentStations: 'कोई हालिया स्टेशन नहीं',

    // Favorite button
    saveToFavorites: 'पसंदीदा में सहेजें',
    alreadyInFavorites: 'पहले से पसंदीदा में है',

    // Transport mode toggle
    toggleAllModes: 'सभी परिवहन साधन चुनें/हटाएं'
  },

  is: {
    // Options panel
    stationName: 'Nafn stöðvar eða biðstöðvar',
    numberOfDepartures: 'Fjöldi brottfara',
    fetchInterval: 'Uppfærslubil (sekúndur)',
    textSize: 'Textastærð',
    transportModes: 'Samgöngumátar (sía)',
    switchLanguage: 'Skipta um tungumál',
    apply: 'Nota',
    save: 'Vista í eftirlæti',
    close: 'Loka',

    // Tooltips
    stationNameTooltip: 'Smelltu til að sýna vistaða eftirlæti',
    settingsTooltip: 'Opna stillingar',
    themeTooltip: 'Breyta þema',
    shareBoard: 'Deila þessari töflu',
    noStationToShare: 'Engin stöð valin til að deila',
    shareFailed: 'Mistókst að búa til deilingartengil',

    // Text sizes
    tiny: 'Örsmátt',
    small: 'Lítið',
    medium: 'Miðlungs',
    large: 'Stórt',
    extraLarge: 'Mjög stórt',

    // Transport modes
    bus: 'Strætó',
    tram: 'Sporvagn',
    metro: 'Neðanjarðarlest',
    rail: 'Lest',
    water: 'Skip',
    coach: 'Hraðbraut',

    // Toast messages
    settingsApplied: 'Stillingar vistaðar',
    filtersUpdated: 'Síur uppfærðar',
    textSizeUpdated: 'Textastærð uppfærð',
    savedToFavorites: 'Vistað í eftirlæti',
    languageChanged: 'Tungumáli breytt',

    // Update toast
    newVersionAvailable: 'Ný útgáfa tiltæk, endurnýja...',
    upgradingFrom: 'Uppfærsla frá',
    to: 'í',

    // Status
    updatingIn: 'Uppfærir eftir',
    seconds: 's',
    now: 'Núna',
    live: 'Beint',
    error: 'Villa',
    noDepartures: 'Engar brottfarir...',

    // Footer
    dataFrom: 'Gögn frá',
    version: 'Útgáfa',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Engin stöð valin',
    noRecentStations: 'Engar nýlegar stöðvar',

    // Favorite button
    saveToFavorites: 'Vista í eftirlæti',
    alreadyInFavorites: 'Þegar í eftirlætum',

    // Transport mode toggle
    toggleAllModes: 'Velja/afvelja allar samgöngur'
  },

  uk: {
    // Options panel
    stationName: 'Назва станції або зупинки',
    numberOfDepartures: 'Кількість відправлень',
    fetchInterval: 'Інтервал оновлення (секунди)',
    textSize: 'Розмір тексту',
    transportModes: 'Транспортні засоби (фільтр)',
    switchLanguage: 'Змінити мову',
    apply: 'Застосувати',
    save: 'Зберегти в обране',
    close: 'Закрити',

    // Tooltips
    stationNameTooltip: 'Натисніть, щоб показати збережене обране',
    settingsTooltip: 'Відкрити панель налаштувань',
    themeTooltip: 'Змінити тему',
    shareBoard: 'Поділитися цією дошкою',
    noStationToShare: 'Не вибрано станцію для спільного доступу',
    shareFailed: 'Не вдалося створити посилання',

    // Text sizes
    tiny: 'Дуже малий',
    small: 'Малий',
    medium: 'Середній',
    large: 'Великий',
    extraLarge: 'Дуже великий',

    // Transport modes
    bus: 'Автобус',
    tram: 'Трамвай',
    metro: 'Метро',
    rail: 'Поїзд',
    water: 'Судно',
    coach: 'Міжміський автобус',

    // Toast messages
    settingsApplied: 'Налаштування застосовано',
    filtersUpdated: 'Фільтри оновлено',
    textSizeUpdated: 'Розмір тексту оновлено',
    savedToFavorites: 'Збережено в обране',
    languageChanged: 'Мову змінено',

    // Update toast
    newVersionAvailable: 'Доступна нова версія, перезавантаження...',
    upgradingFrom: 'Оновлення з',
    to: 'до',

    // Status
    updatingIn: 'Оновлення через',
    seconds: 'с',
    now: 'Зараз',
    live: 'Пряма трансляція',
    error: 'Помилка',
    noDepartures: 'Немає відправлень...',

    // Footer
    dataFrom: 'Дані від',
    version: 'Версія',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Станцію не вибрано',
    noRecentStations: 'Немає недавніх станцій',

    // Favorite button
    saveToFavorites: 'Зберегти в обране',
    alreadyInFavorites: 'Вже в обраному',

    // Transport mode toggle
    toggleAllModes: 'Вибрати/зняти всі засоби транспорту'
  },

  fr: {
    // Options panel
    stationName: 'Nom de la station ou de l\'arrêt',
    numberOfDepartures: 'Nombre de départs',
    fetchInterval: 'Intervalle de mise à jour (secondes)',
    textSize: 'Taille du texte',
    transportModes: 'Modes de transport (filtre)',
    switchLanguage: 'Changer de langue',
    apply: 'Appliquer',
    save: 'Enregistrer dans les favoris',
    close: 'Fermer',

    // Tooltips
    stationNameTooltip: 'Cliquez pour afficher vos favoris enregistrés',
    settingsTooltip: 'Ouvrir le panneau des paramètres',
    themeTooltip: 'Changer de thème',
    shareBoard: 'Partager ce tableau',
    noStationToShare: 'Aucune station sélectionnée à partager',
    shareFailed: 'Échec de création du lien',

    // Text sizes
    tiny: 'Très petit',
    small: 'Petit',
    medium: 'Moyen',
    large: 'Grand',
    extraLarge: 'Très grand',

    // Transport modes
    bus: 'Bus',
    tram: 'Tramway',
    metro: 'Métro',
    rail: 'Train',
    water: 'Bateau',
    coach: 'Autocar',

    // Toast messages
    settingsApplied: 'Paramètres appliqués',
    filtersUpdated: 'Filtres mis à jour',
    textSizeUpdated: 'Taille du texte mise à jour',
    savedToFavorites: 'Enregistré dans les favoris',
    languageChanged: 'Langue modifiée',

    // Update toast
    newVersionAvailable: 'Nouvelle version disponible, rechargement...',
    upgradingFrom: 'Mise à niveau depuis',
    to: 'vers',

    // Status
    updatingIn: 'Mise à jour dans',
    seconds: 's',
    now: 'Maintenant',
    live: 'En direct',
    error: 'Erreur',
    noDepartures: 'Aucun départ...',

    // Footer
    dataFrom: 'Données de',
    version: 'Version',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Aucune station sélectionnée',
    noRecentStations: 'Aucune station récente',

    // Favorite button
    saveToFavorites: 'Enregistrer dans les favoris',
    alreadyInFavorites: 'Déjà dans les favoris',

    // Transport mode toggle
    toggleAllModes: 'Sélectionner/désélectionner tous les modes'
  },

  pl: {
    // Options panel
    stationName: 'Nazwa stacji lub przystanku',
    numberOfDepartures: 'Liczba odjazdów',
    fetchInterval: 'Interwał odświeżania (sekundy)',
    textSize: 'Rozmiar tekstu',
    transportModes: 'Środki transportu (filtr)',
    switchLanguage: 'Zmień język',
    apply: 'Zastosuj',
    save: 'Zapisz w ulubionych',
    close: 'Zamknij',

    // Tooltips
    stationNameTooltip: 'Kliknij, aby wyświetlić zapisane ulubione',
    settingsTooltip: 'Otwórz panel ustawień',
    themeTooltip: 'Zmień motyw',
    shareBoard: 'Udostępnij tę tablicę',
    noStationToShare: 'Nie wybrano stacji do udostępnienia',
    shareFailed: 'Nie udało się utworzyć linku',

    // Text sizes
    tiny: 'Bardzo mały',
    small: 'Mały',
    medium: 'Średni',
    large: 'Duży',
    extraLarge: 'Bardzo duży',

    // Transport modes
    bus: 'Autobus',
    tram: 'Tramwaj',
    metro: 'Metro',
    rail: 'Pociąg',
    water: 'Statek',
    coach: 'Autokar',

    // Toast messages
    settingsApplied: 'Ustawienia zastosowane',
    filtersUpdated: 'Filtry zaktualizowane',
    textSizeUpdated: 'Rozmiar tekstu zaktualizowany',
    savedToFavorites: 'Zapisano w ulubionych',
    languageChanged: 'Język zmieniony',

    // Update toast
    newVersionAvailable: 'Nowa wersja dostępna, przeładowanie...',
    upgradingFrom: 'Aktualizacja z',
    to: 'do',

    // Status
    updatingIn: 'Aktualizacja za',
    seconds: 's',
    now: 'Teraz',
    live: 'Na żywo',
    error: 'Błąd',
    noDepartures: 'Brak odjazdów...',

    // Footer
    dataFrom: 'Dane z',
    version: 'Wersja',
    starOnGitHub: 'GitHub',

    // Station dropdown
    noStationSelected: 'Nie wybrano stacji',
    noRecentStations: 'Brak ostatnich stacji',

    // Favorite button
    saveToFavorites: 'Zapisz w ulubionych',
    alreadyInFavorites: 'Już w ulubionych',

    // Transport mode toggle
    toggleAllModes: 'Zaznacz/odznacz wszystkie środki transportu'
  }
};

export { translations };
