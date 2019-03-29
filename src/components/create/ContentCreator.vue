<template lang="pug">
    .content-creator
        .content-creator__controls
            q-btn(round icon="add" outline color="black" @click="$emit('create')")
</template>

<script>
export default {
    name: 'ContentCreator',
    props: {},
    data() {
     return {};
    },
    computed: {
    },
    methods: {
    },
};
</script>

<style lang="stylus">
    .content-creator
        position relative
        display grid
        grid-template-columns 1fr
        grid-template-rows 1fr
        width 100vw
        height 56vw
        border 1px dashed silver
        backgroud #f0
        overflow hidden
        &__controls
            align-self center
</style>
