<template lang="pug">
<!--    q-page.kp-setting.text-center.bold
        h6.text-weight-bold.head-title Настройки
        p.text-weight-regular.text-left Познай суть, иначе будет полная муть. Повышай осознанность, просветляй мозги, стирай носки.
        q-list.rounded-borders(bordered)
            div.rounded-borders(v-for="(block, ix) in settings" bordered)
                q-expansion-item.kp-setting__section.expansion-border(expand-separator icon="security" :label="block.name" switch-toggle-side)
                    div.q-pa-md(v-for="(blocks, ix) in block.elements")
                        div(v-if="block.type === section")
                            q-expansion-item.kp-setting__section(:label="blocks.name" switch-toggle-side expand-separator dense dense-toggle)
                                div(v-for="(blockItem, ix) in blocks.elements")
                                    .kp-setting__wrap.flex(v-if="blockItem.type === typeBtnToggle" class='toggle')
                                        .flex__item
                                            span.small-text {{blockItem.name}}
                                        .flex__item
                                            q-toggle(v-model="blockItem.enabled" color="primary")
                                    .kp-setting__wrap.flex.q-mb-md(v-if="blockItem.type === typeTextInput" class='text')
                                        .flex__item
                                            span.small-text {{blockItem.name}}
                                        .flex__item
                                            q-input(filled v-model="blockItem.value" dense)
                                    .kp-setting__wrap.flex(v-if="blockItem.type === typeSelectedItems" class='toggle')
                                        .flex__item.q-mb-sm
                                            span.small-text {{blockItem.name}}
                                        .flex__item
                                            div.q-gutter-md.row.items-start
                                                q-select.selected-fields(v-model="blockItem.selectedValue" :options="blockItem.possibleValues" :disable="blockItem.enabled")
                                    .kp-setting__wrap.flex(v-if="blockItem.type === typeRadio" class='toggle')
                                        .flex__item.q-mb-sm
                                            span.small-text {{blockItem.name}}
                                        .flex__item
                                            div.q-gutter-md.row.items-start
                                                q-radio(v-for="radioItem in blockItem.possibleValues" v-model="radioItem" :val="radioItem" :label="radioItem")
                        div(v-if="block.type !== section")
                            .kp-setting__wrap.flex(v-if="blocks.type === typeBtnToggle" class='toggle')
                                .flex__item
                                    span.small-text {{blocks.name}}
                                .flex__item
                                    q-toggle(v-model="blocks.enabled" color="primary")
                            .kp-setting__wrap.flex(v-if="blocks.type === typeTextInput" class='text')
                                .flex__item.q-mb-sm
                                    span.small-text {{blocks.name}}
                                .flex__item
                                    q-input(filled v-model="blocks.value")
                            .kp-setting__wrap.flex(v-if="blocks.type === typeSelectedItems" class='toggle')
                                .flex__item.q-mb-sm
                                    span.small-text {{blocks.name}}
                                .flex__item
                                    div.q-gutter-md.row.items-start
                                        q-select.selected-fields(v-model="blocks.selectedValue" :options="blocks.possibleValues" :disable="blocks.enabled")  -->
</template>
<script>
/*
const SETTING_TYPE = { section: 1, textInput: 2, intInput: 3, dateInput: 4, radio: 5, checkBox: 6, toggle: 7, buttonToggle: 8, selectItem: 9 };
*/

/* const SECTION1 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Пароль',
    elements: [
        { name: 'Текущий пароль', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
        { name: 'Новый пароль', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
        { name: 'Новый пароль еще раз', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
    ],
};
const SECTION2 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Сохранить данные для входа',
    elements: [
        { name: 'Сохранить данные для входа', type: SETTING_TYPE.buttonToggle, enabled: false },
    ],
};
const SECTION3 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Активные сессии',
    elements: [
        { name: 'Активные сессии', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
    ],
};
const SECTION4 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Сообщить о проблеме',
    elements: [
        { name: 'Сообщить о проблеме', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
    ],
};
const SECTION5 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Справочный центр',
    elements: [
        { name: 'Справочный центр', type: SETTING_TYPE.textInput, enabled: true, value: 'Значение3' },
    ],
};
const SECTION6 = {
    type: SETTING_TYPE.buttonToggle,
    name: 'Закрытый аккаунт',
    elements: [
        { name: 'Разрешить людям находить меня', type: SETTING_TYPE.buttonToggle, enabled: false },
    ],
};
const SECTION7 = {
    type: SETTING_TYPE.radio,
    name: 'Кто может просматривать созданные мной ядра',
    elements: [
        { name: 'RAD', type: SETTING_TYPE.radio, enabled: true, possibleValues: ['New York', 'Washington', 'Chicago'] },

    ],
};
const SECTION8 = {
    type: SETTING_TYPE.radio,
    name: 'Кто может просматривать ядра за которые я проголосовал',
    elements: [
        { name: 'RAD', type: SETTING_TYPE.radio, enabled: true, possibleValues: ['New York', 'Washington', 'Chicago'] },

    ],
};
const SECTION9 = {
    type: SETTING_TYPE.radio,
    name: 'Кто может просматривать ядра кторые связали со мной',
    elements: [
        { name: 'RAD', type: SETTING_TYPE.radio, enabled: true, possibleValues: ['New York', 'Washington', 'Chicago'] },

    ],
};
const SECTION10 = {
    type: SETTING_TYPE.radio,
    name: 'Кто может просматривать созданные мной цепочки',
    elements: [
        { name: 'RAD', type: SETTING_TYPE.radio, enabled: true, possibleValues: ['New York', 'Washington', 'Chicago'] },

    ],
};

const SECTION20 = {
    type: SETTING_TYPE.section,
    name: 'Безопасность',
    elements: [
        SECTION1,
        SECTION2,
        SECTION3,
    ],
};
const SECTION30 = {
    type: SETTING_TYPE.section,
    name: 'Справка',
    elements: [
        SECTION4,
        SECTION5,
    ],
};
const SECTION31 = {
    type: SETTING_TYPE.section,
    name: 'Конфиденциальность',
    elements: [
        SECTION6,
        SECTION7,
        SECTION8,
        SECTION9,
        SECTION10,
    ],
};
const SECTION77 = {
    type: SETTING_TYPE.selectItem,
    name: 'Города',
    elements: [
        { name: 'Список', type: SETTING_TYPE.selectItem, enabled: true, possibleValues: ['New York', 'Washington', 'Chicago'], selectedValue: 'Washington', value: 'Значение9' },
        { name: 'Список 2', type: SETTING_TYPE.selectItem, enabled: false, possibleValues: ['New York', 'Washington', 'Chicago', 'Boston'], selectedValue: 'Chicago', value: 'Значение9' },
        { name: 'Список 2', type: SETTING_TYPE.selectItem, possibleValues: ['New York', 'Washington', 'Chicago', 'Boston'], selectedValue: 'Chicago', value: 'Значение9' },
    ],
}; */

/* const SETTINGS = [SECTION77, SECTION20, SECTION30, SECTION31]; */

export default {
    name: 'Setting',
    data() {
        return {};
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
    .kp-setting__wrap
        &.toggle
            align-items center
            .flex__item
                width 50% !important
                text-align right
                align-items center
                &:first-child
                    text-align left
        &.text
            text-align left
            flex-direction column
</style>
