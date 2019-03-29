<template lang="pug">
    .kp-bead(:class="{'kp-bead_selected': selected}")
        .kp-bead__fill(:style="fillStyle" :class="{'kp-bead__fill_selected': selected}")
        .kp-bead__text {{ text }}
</template>

<script>
export default {
    name: 'Bead',
    props: {
        percentFill: {
            type: Number,
            default: 0,
        },
        selected: {
            type: Boolean,
            default: false,
        },
        text: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        fillStyle() {
            return `height: ${this.percentFill}%;`;
        },
    },
    methods: {
    },
};
</script>

<style lang="stylus">
    .kp-bead
        display inline-block
        position relative
        height 8vw
        width 8vw
        border-radius 50%
        border 1px solid black
        background white
        overflow hidden
        cursor pointer
        &_selected
            border-color red

        &__text
            display block
            position absolute
            top 1vw
            left 0
            right 0
            bottom 0
            text-align center
            color white
            font-size 4vw
            text-shadow 0px 2px 1px black, 0px -2px 1px black, -2px 0px 1px black, 2px 0px 1px black

        &__fill
            display block
            position absolute
            left 0
            right 0
            bottom 0
            background black
            &_selected
                background-color red
</style>
