<template lang="pug">
    // .kp-node-list(ref="list" v-touch-swipe.up="swipeUp" v-touch-swipe.down="swipeDown" v-touch-pan.up="panUp" v-touch-pan.down="panDown"  @wheel.prevent="catchScroll")
    .kp-node-list(@scroll="touchMove")
        //.kp-node-list__container(v-touch-swipe.mouse.up.down="switchGrain")
        .kp-node-list__container( ref="list")
            node(flat bordered v-for="(card, ix) in source" :key="ix" :item="card" :ix="ix" :ref="'card-' + ix")
    // button.test(@click="scroll(100)") Scroll
</template>

<script>
    import node from './Node';

    export default {
        name: 'NodeList',
        components: { node },
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

                prevScroll: 0,
                isLoading: false,
            };
        },
        watch: {
            source(val) {
                this.isLoading = false;
                // console.log('=== SOURCE', val);
            }
        },
        methods: {
            touchMove(e) {
                // генерация события @end по мере приближения к концу ленты
                if (!this.isLoading) {
                    const rect = this.$refs.list.getBoundingClientRect();
                    const { body } = window.document;
                    const delta = Math.abs(this.prevScroll - e.srcElement.scrollTop);
                    const koef = Math.floor(delta / 20);
                    const limit = body.clientHeight * (2 + koef);

                    let direction = 'none';
                    if (e.srcElement.scrollTop > this.prevScroll) direction = 'down';
                    else if (e.srcElement.scrollTop < this.prevScroll) direction = 'up';

                    if (direction === 'down' && (rect.top + rect.height) < limit) {
                        const item = this.source[this.source.length - 1];

                        this.isLoading = true;
                        this.$emit('end', item.oid);
                    }
                    /*
                    // Подгрузка сверху отключена как дорогая операция
                    else if (direction === 'up' && rect.top < (rect.height - limit)) {
                        const item = this.source[0];
                        // this.$emit('begin', item.oid);
                        console.log('prePEND!!!');
                    }
                    */
                }
                const a = this.prevScroll;
                const b = e.srcElement.scrollTop;
                // console.log('prev =', a, ' scroll =', b, ' delta =', a - b);
                this.prevScroll = e.srcElement.scrollTop;
            },
            scroll(by) {
                // if (this.timer) return;

                const MARGIN = 6;
                const ref = this.$refs.list;
                const rect = this.$refs['card-0'][0].$el.getBoundingClientRect();
                const mainRect = ref.getBoundingClientRect();

                // eslint-disable-next-line
                let { target, timer } = this;
                let delta = rect.top > 0 ? 30 : 0; // смещение для позиционирования по центру
                if (mainRect.height <= rect.height) delta = 0;
                delta = 0;

                target += Math.sign(by) * (rect.height + MARGIN - delta);
                this.timer = setInterval(() => {
                    if (ref) {
                        const newValue = parseInt(target * 1 / 2, 0);
                        ref.scrollBy(0, target - newValue);
                        target = newValue;
                    }
                    if (!ref || target === 0) {
                        clearInterval(timer);
                        timer = 0;
                    }
                }, 10);
            },
            swipeUp(e) {
//                console.log(e);
                // this.scroll(1);
                // eslint-disable-next-line
                const ref = this.$refs.list;
                ref.scrollBy(e.distance);
                this.$emit('swipeUp', e);
            },
            swipeDown(e) {
//                console.log(e);
                // this.scroll(-1);
                // eslint-disable-next-line
                const ref = this.$refs.list;
                ref.scrollBy(e.distance);
                this.$emit('swipeDown', e);
            },
            panUp() {
                // if (!this.timer) this.scroll(1);
            },
            panDown() {
                // if (!this.timer) this.scroll(-1);
            },
            catchScroll(e) {
                return e;
                // e.target.dispatchEvent(e);
                // if (e.deltaY > 0) this.scroll(1);
                // else if (e.deltaY < 0) this.scroll(-1);
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
    .kp-node-list
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
