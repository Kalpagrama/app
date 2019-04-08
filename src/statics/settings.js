export default {
    const ELEMENT_TYPE_ENUM = { section: 0, textInput: 1, intInput: 2, dateInput: 3, radio: 4, checkBox: 5, toggle: 6, buttonToggle: 7, listView: 8, button: 9 };
    const SECTION_INVITE = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Приглашение и подписка на друзей',
        elements: [], // todo
    };
    const SECTION_NOTICE = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Уведомления',
        elements: [], // todo
    };
    const SECTION_ACCOUNT = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Аккаунт',
        elements: [], // todo
    };
    const SECTION_CONF = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Конфиденциальность',
        elements: [], // todo
    };
    const SECTION_PASSWORD = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Пароль',
        elements: [
            { type: ELEMENT_TYPE_ENUM.textInput, name: 'Текущий пароль', enabled: true, value: 'Значение3' },
            { type: ELEMENT_TYPE_ENUM.textInput, name: 'Новый пароль',  enabled: true, value: 'Значение3' },
            { type: ELEMENT_TYPE_ENUM.textInput,name: 'Новый пароль еще раз', enabled: true, value: 'Значение3' },
        ],
    };
    const SECTION_ACTIVE_SESSIONS = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Активные сессии',
        elements: [
            { type: ELEMENT_TYPE_ENUM.listview, name: 'список активных сессий', enabled: true, value: ['сессия №1', 'сессия №2', 'сессия №3'] },
            { type: ELEMENT_TYPE_ENUM.button, name: 'Завершить все сессии', enabled: true, value: null },
        ],
    };
    const SECTION_SAFETY = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Безопасность',
        elements: [
            SECTION_PASSWORD,
            {type: ELEMENT_TYPE_ENUM.buttonToggle, name: 'Сохранить данные для входа',  enabled: false },
            SECTION_ACTIVE_SESSIONS,
        ],
    };
    const SECTION_HELP = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Справка',
        elements: [], // todo
    };
    const SECTION_INFO = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Информация',
        elements: [], // todo
    };
    const SETTINGS = {
        type: ELEMENT_TYPE_ENUM.section,
        name: 'Настройки программы',
        elements: [
            SECTION_INVITE,
            SECTION_NOTICE,
            SECTION_ACCOUNT,
            SECTION_CONF,
            SECTION_SAFETY,
            SECTION_HELP,
            SECTION_INFO,
            { type: ELEMENT_TYPE_ENUM.button, name: 'Выйти', enabled: true, value: null },
        ],
    };
};


