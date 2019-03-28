<template lang="pug">
    .kp-setting
        h6 Settings
</template>
<script>

    export default {
        name: 'Setting',
        data() {
            return {
                settingsItem: {
                    name: 'имя элемента настройки',
                    enabled: true,
                    possibleValues: ['one', 'two', 'three'],
                    selectedValue: 'one',
                    props: {},
                },
            };
        },
    };
</script>
<style lang="stylus">
    .kp-setting
        display block
        padding 16px
        border-top 1px solid silver
        min-height 200px
</style>
