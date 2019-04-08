<template lang="pug">
    .kp-voter(v-touch-hold.mouse="startTap" @click="endTap" @mouseover.stop="say('', -1)")
        .kp-voter__advanced(v-if="tapped")
            q-btn.kp-voter__button(round :color="color('red')" :outline="isOutline(0)" @mouseover.stop="say('Точно нет', 0)" icon="clear" @click="vote(0)")
            q-btn.kp-voter__button(round :color="color('warning')" size="sm" :outline="isOutline(25)" @mouseover.stop="say('Скорее нет', 25)" icon="clear" @click="vote(25)")
            q-btn.kp-voter__button(round :color="color('primary')" :outline="isOutline(50)" @mouseover.stop="say('Может быть', 50)" icon="change_history" @click="vote(50)")
            q-btn.kp-voter__button(round :color="color('secondary')" size="sm" :outline="isOutline(75)" @mouseover.stop="say('Скорее да', 75)" icon="check" @click="vote(75)")
            q-btn.kp-voter__button(round :color="color('green')" :outline="isOutline(100)" @mouseover.stop="say('Точно да', 100)" icon="done_all" @click="vote(100)")

        .kp-voter__simple(v-else)
            .kp-voter__views 2K
            q-btn.kp-voter__button(round :color="color('red')" :outline="isOutline(0)" @mouseover.stop="say('Нет', 0)" icon="clear" @click="vote(0)")
            q-btn.kp-voter__button(round :color="color('primary')" :outline="isOutline(50)" @mouseover.stop="say('Может быть', 50)" icon="change_history" @click="vote(50)")
            q-btn.kp-voter__button(round :color="color('green')" :outline="isOutline(100)" @mouseover.stop="say('Да', 100)" icon="check" @click="vote(100)")
            .kp-voter__vote 75%

        .kp-voter__text(v-if="text && tooltip !== 'none'")
            span {{ text }}

</template>

<script>
    // const DELTA_TIME = 1000;

    export default {
        name: 'Voter',
        props: {
            tooltip: {
                type: String,
                default: 'top' // 'none', 'bottom'
            }
        },
        data () {
            return {
                isTapped: false,
                text: '',
                value: 50,
                hoverValue: -1,
                closer: false
            }
        },
        computed: {
            tapped () {
                return this.isTapped
            }
        },
        methods: {
            clearCloser () {
                if (this.closer) {
                    clearTimeout(this.closer)
                }
                this.closer = false
            },
            tapCloser () {
                this.isTapped = false
                this.text = ''
            },
            color (color) {
                return this.vote ? color : 'white'
            },
            isOutline (vote) {
                return (this.value !== vote) && (this.hoverValue !== vote)
            },
            startTap () {
                this.clearCloser()
                this.isTapped = true
            },
            endTap () {
                this.closer = setTimeout(this.tapCloser.bind(this), 1000)
            },
            say (text, hoveredValue) {
                this.text = text
                this.hoverValue = hoveredValue
            },
            vote (vote) {
                this.value = vote
                this.clearCloser()
                this.endTap()
            }
        }
    }
</script>

<style lang="stylus">
    .kp-voter
        display block
        width 100%
        height 60px
        padding 8px
        border-top 1px solid #c0
        border-bottom 1px solid #c0

        &__text
            margin-top -100px
            text-align center

            & span
                background #f0
                color gray
                text-align center
                position relative
                padding 16px
                font-size 20px

        &__simple
            display grid
            grid-template-columns 1fr 1fr 1fr 1fr 1fr
            grid-column-gap 16px
            text-align center

        &__advanced
            display grid
            grid-template-columns 1fr 1fr 1fr 1fr 1fr
            grid-column-gap 16px
            text-align center

        &__views
        &__vote
            color gray
            font-size 20px
            align-self center
            text-align center
            justify-self center

        &__button
            align-self center
            text-align center
            justify-self center
</style>
