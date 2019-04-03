<template lang="pug">
    q-page.kp-setting.text-center.bold
        h6.text-weight-bold.head-title Настройки
        p.text-weight-regular.text-left Познай суть, иначе будет полная муть. Повышай осознанность, просветляй мозги, стирай носки.
            q-list.rounded-borders.q-mt-md(bordered)
                div.rounded-borders(v-for="(block, ix) in settings.elements" bordered)
                        div(v-if="block.elements")
                            q-expansion-item.kp-setting__section.expansion-border.first_parent(expand-separator :icon='(block.iconName)' :label="block.name" :disable="isValue(block.elements)")
                                div(v-for="blockItem in block.elements")
                                    div(v-if="blockItem.elements")
                                        q-expansion-item.kp-setting__section.expansion-border.second(:label="blockItem.name")
                                            div.q-pa-md(v-for="node in blockItem.elements")
                                                .kp-setting__wrap.flex(v-if="node.type === elementTypeEnum.buttonToggle" class='toggle')
                                                    .flex__item
                                                        span {{node.name}}
                                                    .flex__item
                                                        q-toggle(v-model="node.enabled" color="primary")
                                                .kp-setting__wrap.flex(v-if="node.type === elementTypeEnum.textInput" class='text' dense)
                                                    .flex__item.q-mb-sm
                                                        span.small-text {{node.name}}
                                                    .flex__item
                                                        q-input(filled v-model="node.value" dense)
                                                .kp-setting__wrap.flex(v-if="node.type === elementTypeEnum.listView" class='toggle')
                                                    .flex__item.q-mb-sm
                                                        span.small-text {{node.name}}
                                                    .flex__item
                                                        div.q-gutter-md.row.items-start
                                                            q-select.selected-fields(v-model="node.selectedValue" :options="node.value" :disable="node.enabled")
                                                .kp-setting__wrap.flex(v-if="node.type === elementTypeEnum.button" class='toggle')
                                                    q-btn(:loading='loading' color="red" size="sm" @click="simulateProgress()") {{node.name}}
                                                        template(v-slot:loading) Loading...
                                    div(v-else)
                                        div.q-pa-md
                                            .kp-setting__wrap.flex(v-if="blockItem.type === elementTypeEnum.buttonToggle" class='toggle-button')
                                                .flex__item
                                                    span {{blockItem.name}}
                                                .flex__item
                                                    q-toggle(v-model="blockItem.enabled" color="primary")
                                            .kp-setting__wrap.flex(v-if="blockItem.type === elementTypeEnum.button" class='toggle')
                                                q-btn(:loading='loading1' color="red" size="sm" @click="simulateProgress()") {{blockItem.name}}
                                                    template(v-slot:loading1) Loading...
                                            .kp-setting__wrap.flex(v-if="blockItem.type === elementTypeEnum.listView" class='toggle')
                                                .flex__item.q-mb-sm
                                                    span.small-text {{blockItem.name}}
                                                .flex__item
                                                    div.q-gutter-md.row.items-start
                                                        q-select.selected-fields(v-model="blockItem.selectedValue" :options="blockItem.value" :disable="blockItem.enabled")
</template>

<script>
const ELEMENT_TYPE_ENUM = { section: 0, textInput: 1, intInput: 2, dateInput: 3, radio: 4, checkBox: 5, toggle: 6, buttonToggle: 7, listView: 8, button: 9 };
const SECTION_INVITE = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'person_add',
    name: 'Приглашение и подписка на друзей',
    elements: [], // todo
};
const SECTION_NOTICE = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'add_alert',
    name: 'Уведомления',
    elements: [
        { type: ELEMENT_TYPE_ENUM.listView, name: 'Список активных сессий', enabled: false, value: ['сессия №1', 'сессия №2', 'сессия №3'], selectedValue: 'сессия №1' },
        { type: ELEMENT_TYPE_ENUM.button, name: 'Завершить все сессии', enabled: true, value: null },
    ], // todo
};
const SECTION_ACCOUNT = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'account_circle',
    name: 'Аккаунт',
    elements: [], // todo
};
const SECTION_CONF = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'pan_tool',
    name: 'Конфиденциальность',
    elements: [], // todo
};
const SECTION_PASSWORD = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'person_add',
    name: 'Пароль',
    elements: [
        { type: ELEMENT_TYPE_ENUM.textInput, name: 'Текущий пароль', enabled: true, value: 'Значение3' },
        { type: ELEMENT_TYPE_ENUM.textInput, name: 'Новый пароль', enabled: true, value: 'Значение3' },
        { type: ELEMENT_TYPE_ENUM.textInput, name: 'Новый пароль еще раз', enabled: true, value: 'Значение3' },
    ],
};
const SECTION_ACTIVE_SESSIONS = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'person_add',
    name: 'Активные сессии',
    elements: [
        { type: ELEMENT_TYPE_ENUM.listView, name: 'Список активных сессий', enabled: false, value: ['сессия №1', 'сессия №2', 'сессия №3'], selectedValue: 'сессия №1' },
        { type: ELEMENT_TYPE_ENUM.button, name: 'Завершить все сессии', enabled: true, value: null },
    ],
};
const SECTION_SAFETY = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'lock',
    name: 'Безопасность',
    elements: [
        SECTION_PASSWORD,
        { type: ELEMENT_TYPE_ENUM.buttonToggle, name: 'Сохранить данные для входа', enabled: false },
        { type: ELEMENT_TYPE_ENUM.button, name: 'Стереть все данные', enabled: true, value: null },
        SECTION_ACTIVE_SESSIONS,
    ],
};
const SECTION_HELP = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'contact_support',
    name: 'Справка',
    elements: [], // todo
};
const SECTION_INFO = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'info',
    name: 'Информация',
    elements: [], // todo
};
const SETTINGS = {
    type: ELEMENT_TYPE_ENUM.section,
    iconName: 'person_add',
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

export default {
    name: 'Setting',
    data() {
        return {
            settings: SETTINGS,
            elementTypeEnum: ELEMENT_TYPE_ENUM,
            loading: false,
            loading1: false,
            disabled: false,
        };
    },
    methods: {
        simulateProgress() {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 3000);
        },
        isValue(arLength) {
            if (arLength.length === 0) {
                return true;
            } return false;
        },
    },
    created() {
    },
};
</script>
<style lang="stylus">
    .expansion-border
        border-top 1px solid #ccc
        border-bottom 1px solid #ccc
    .kp-setting
        display block
        padding 16px
        border-top 1px solid silver
        margin-top 10px
        min-height 200px
        .kp-setting__section
            overflow initial
            .selected-fields
                width 100%
        .q-icon
            color #7030a0
    .kp-setting__wrap
        &.toggle
            align-items center
            .flex__item
                width 50% !important
                text-align right
                align-items center
                &:first-child
                    text-align left
        &.toggle-button
            align-items center
            .flex__item
                width 20% !important
                text-align right
                align-items center
                &:first-child
                    text-align left
                    width 80% !important
        &.text
            text-align left
            flex-direction column
</style>
