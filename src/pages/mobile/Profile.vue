<template lang="pug">
    q-page.flex.kp-profile
        .kp-profile__header(@click="toggle" @scroll="scrollProfile")
            q-card.kp-profile__visitcard(flat dense v-show="mode > 0" :class="{'kp-profile__visitcard_mode-2': mode === 2}")

                .kp-profile__face
                    img.kp-profile__image(:src='imageSrc()' :class="{'kp-profile__image_mode-2': mode === 2}")

                .kp-profile__info(:class="{'kp-profile__info_mode-2': mode === 2}")
                    .kp-profile__username(:class="{'kp-profile__username_mode-2': mode === 2}") Username
                    .kp-profile__quote(v-if="mode !== 2") {{ statusText }}

            .kp-profile__quote_mode-2(v-if="mode === 2") {{ statusText }}

            .kp-profile__settings(v-if="mode === 2")
                .kp-profile__quit
                    q-btn(color="white" text-color="black" label="Выйти из аккаунта" size="sm" @click="queryLogout")

            q-card.kp-profile__filter(v-show="mode < 2")
                q-btn-group(outline)
                    q-btn(outline :label="item.label" v-for="(item,ix) in BUTTONS" :key="ix" size="sm")

        //node-list.kp-profile__nodes(:source="cards" :class="{'kp-profile_mode-0': mode === 0}" v-show="mode < 2" @swipe-up="onSwipeUp" @swipe-down="onSwipeDown")
        news-feed.kp-profile__nodes(:class="{'kp-profile_mode-0': mode === 0}" v-show="mode < 2" @swipe-up="onSwipeUp" @swipe-down="onSwipeDown")
</template>

<style lang="stylus">
    .kp-profile
        display block
        width 100%

        &__header
            display block
            border-bottom 1px solid #c0

        &__visitcard
            display grid
            grid-template-columns 95px auto
            grid-gap 16px
            height 130px
            padding 16px
            border-bottom 1px solid #c0

            &_mode-2
                display block
                height 400px
                padding 0

        &__face
            display block

        &__image
            width 95px
            height 95px
            border 1px solid silver
            background #f0
            border-radius 50%
            overflow hidden

            &_mode-2
                display block
                height 400px
                width 100%
                border-radius 0
                border none

        &__info
            padding-top 8px

        &__username
            font-size 18px

            &_mode-2
                font-size 24px
                display block
                position relative
                color white
                text-shadow 0px 2px 6px black, 0px -2px 6px black, -2px 0px 6px black, 2px 0px 6px black
                top -50px
                left 16px

        &__quote
            color gray
            font-size 14px

            &_mode-2
                font-size 20px
                padding 16px

        &__filter
            text-align center
            padding 16px

        &__nodes
            top 190px

        &_mode-0
            top 60px

        &__quit
            text-align center
            padding 16px
            border-top 1px solid silver

</style>

<script>
    import NodeList from '../../components/NodeList'
    import AuthMixin from './auth/AuthMixin';
    import NewsFeed from '../../components/news/NewsFeed';

    const BUTTONS = [
        { id: 1, label: 'Ядра' },
        { id: 2, label: 'Оценки' },
        { id: 3, label: 'Связи' }
    ]

    export default {
        name: 'PageMobileProfile',
        mixins: [AuthMixin],
        components: {
            NewsFeed,
            'node-list': NodeList,
        },
        data () {
            return {
                cards: [],
                mode: 1,
                BUTTONS,
                statusText: 'Свайп пока не работает, для просмотра состояний кликни на визитку'
            }
        },
        beforeMount () {
            for (let i = 0; i < 20; i += 1) {
                this.cards.push(i)
            }
        },
        computed: {
            isVisible () {
                return this.mode > 0
            }
        },
        methods: {
            imageSrc () {
                return this.mode === 1 ? 'https://placebeard.it/95x95' : 'https://placebeard.it/400x400'
            },
            scrollProfile (e) {
                console.log(e)
            },
            toggle () {
                this.mode += 1
                if (this.mode === 3) this.mode = 0
            },
            onSwipeUp (e) {
                console.log('swipe up', e)
            },
            onSwipeDown (e) {
                console.log('swipe down', e)
            },
            queryLogout () {
                // eslint-disable-next-line
                if (confirm('Завершить работу?')) {
                    this.auth.logout();
                }
            }
        }
    }
</script>
