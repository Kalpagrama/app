<template lang="pug">
    div.trend-item(:style='itemStyle' @click="$emit('click', item)")
        div.text-white.trend-item__label {{ item.label }}
</template>

<script>
    export default {
        name: 'TrendItem',
        props: {
            item: {
                type: Object,
                default: () => ({}),
            },
        },
        computed: {
            itemStyle() {
                return `background: url(${this.item.image});`;
            },
        },
    };
</script>

<style lang="stylus">
    .trend-item
        display inline-block
        width 150px
        height 84px
        margin-right 8px
        border-radius 6px
        border 1px solid silver
        &:last-child
            margin-right 0
        &__label
            text-align center
            text-shadow 5px 5px 5px rgba(0,0,0,0.5)
            margin-top 60px
</style>
