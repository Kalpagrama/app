<template lang="pug">
    q-page.kp-setting.text-center.bold
        h6.text-weight-bold.head-title Настройки
        p.text-weight-regular.text-left Познай суть, иначе будет полная муть. Повышай осознанность, просветляй мозги, стирай носки.
        q-list.rounded-borders(bordered)
            div(v-for="(block, ix) in settings")
                q-expansion-item(expand-separator icon="settings" label="Настройки")
                    div.q-pa-md(v-for="blocks in block")
                        .kp-setting__wrap.flex(v-if="blocks.type === 7" class='toggle')
                            .flex__item
                                span.small-text {{blocks.name}}
                            .flex__item
                                q-toggle(v-model="blocks.enabled" color="primary")
                        .kp-setting__wrap.flex(v-if="blocks.type === 1" class='text')
                            .flex__item.q-mb-sm
                                span.small-text {{blocks.name}}
                            .flex__item
                                q-input(filled v-model="blocks.value")
</template>
<script>
const SETTING_TYPE = { textInput: 1, intInput: 2, dateInput: 3, radio: 4, checkBox: 5, toggle: 6, buttonToggle: 7 };
const SECTION1 = [
    { name: 'имя элемента настройки1', type: SETTING_TYPE.buttonToggle, enabled: false },
    { name: 'имя элемента настройки2', type: SETTING_TYPE.buttonToggle, enabled: true },
    { name: 'Текстовое значение3', type: SETTING_TYPE.textInput, class: 'text', enabled: true, possibleValues: ['one', 'two', 'three'], selectedValue: 'one', value: 'Значение1' },
    { name: 'Текстовое значение4', type: SETTING_TYPE.textInput, class: 'text', enabled: true, possibleValues: ['one', 'two', 'three'], selectedValue: 'one', value: 'Значение2' },
];
const SECTION2 = [
    { name: 'имя элемента настройки5', type: SETTING_TYPE.buttonToggle, enabled: true },
    { name: 'имя элемента настройки6', type: SETTING_TYPE.buttonToggle, enabled: false },
    { name: 'Текстовое значение7', type: SETTING_TYPE.textInput, class: 'text', enabled: true, possibleValues: ['one', 'two', 'three'], selectedValue: 'one', value: 'Значение3' },
    { name: 'Текстовое значение8', type: SETTING_TYPE.textInput, class: 'text', enabled: true, possibleValues: ['one', 'two', 'three'], selectedValue: 'one', value: 'Значение4' },
];
const SETTINGS = [SECTION1, SECTION2];

export default {
    name: 'Setting',
    data() {
        return {
            settings: SETTINGS,
        };
    },
     created() {},
};
</script>
<style lang="stylus">
    .kp-setting
        display block
        padding 16px
        border-top 1px solid silver
        margin-top 10px
        min-height 200px
    .kp-setting__wrap
        &.toggle
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
