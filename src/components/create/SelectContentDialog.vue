<template lang="pug">
    q-dialog(v-model='isActive')
        q-card
            q-card-section.row.items-center
                .text-h6 Close icon
                q-space
                    q-btn(icon='close', flat='', round='', dense='', v-close-popup='')
            q-card-section Some Text

</template>

<script>
export default {
    name: 'SelectContentDialog',
    props: {
        active: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isActive: true,
        };
    },
    watch: {
        active(value) {
//            console.log('active', value);
            this.isActive = value;
        },
        isActive(value) {
//            console.log('isActive', value);
            if (!value) this.$emit('close');
        },
    },
    computed: {
    },
    methods: {
    },
};
</script>

<style lang="stylus">

</style>
