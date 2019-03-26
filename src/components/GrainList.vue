<template lang="pug">
    .kp-grain-list(ref="list" v-touch-swipe.up="swipeUp" v-touch-swipe.down="swipeDown")
        //.kp-grain-list__container(v-touch-swipe.mouse.up.down="switchGrain")
        .kp-grain-list__container()
            grain(flat bordered v-for="(card, ix) in source" :key="ix" :item="{id: card}" :ix="ix" :ref="'card-' + ix")
    // button.test(@click="scroll(100)") Scroll
</template>

<script>
    import grain from './Grain';

    export default {
        name: 'GrainList',
        components: { grain },
        props: {
            source: {
                type: Array,
                default: () => ([]),
            },
        },
        data() {
            return {
                index: 0,
                timer: 0,
                target: 0,
            };
        },
        methods: {
            scroll(by) {
                const MARGIN = 6;
                const ref = this.$refs.list;
                const rect = this.$refs['card-0'][0].$el.getBoundingClientRect();

                // eslint-disable-next-line
                let { target, timer } = this;
                const delta = rect.top > 0 ? 30 : 0; // смещение для позиционирования по центру

                target += Math.sign(by) * (rect.height + MARGIN - delta);
                this.timer = setInterval(() => {
                    if (ref) {
                        const newValue = parseInt(target * 2 / 3, 0);
                        ref.scrollBy(0, target - newValue);
                        target = newValue;
                    }
                    if (!ref || target === 0) {
                        clearInterval(timer);
                    }
                }, 50);
            },
            swipeUp() {
                this.scroll(300);
            },
            swipeDown() {
                this.scroll(-300);
            },
        },
    };
</script>

<style lang="stylus">
    .test
        display block
        z-index 10
        position fixed
        top 50px
        left 50px
    .kp-grain-list
        outline 1px solid red
        position absolute
        top 0
        bottom 0
        left 0
        right 0
        overflow auto
        &__container
            display block
            height auto
            // border 2px solid green
</style>
