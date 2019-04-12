/* eslint-disable */
<template lang="pug">
    q-page.flex.kp-sphere
        .kp-sphere__header
            q-card.kp-sphere__visitcard(flat dense v-show="mode > 0" :class="{'kp-sphere__visitcard_mode-2': mode === 2}")

                .kp-sphere__face
                    img.kp-sphere__image(:src='item.thumbUrl' :class="{'kp-sphere__image_mode-2': mode === 2}")

                .kp-sphere__info(:class="{'kp-sphere__info_mode-2': mode === 2}")
                    .kp-sphere__name(:class="{'kp-sphere__name_mode-2': mode === 2}") {{item.name}}
                    .kp-sphere__descript
                        span.kp-sphere__text 20K
                        q-btn(size="sm" outline) Подписаться

            .kp-sphere__filter
                sphere-chips.kp-sphere__chips(:parent-oid="sphereOid" @clicked="open")

        // node-list.kp-sphere__nodes(:source="cards" :class="{'kp-sphere_mode-0': mode === 0}" v-show="mode < 2")
        node-list(:source="nodes" :class="{'kp-sphere_mode-0': mode === 0}" v-show="mode < 2")

        beads.kp-sphere__beads
</template>

<script>
    import Setting from '../../components/Setting';
    import Beads from '../../components/Beads';
    import SphereChips from '../../components/sphere/SphereChips';
    import NodeList from '../../components/NodeList';

    import { mapState } from 'vuex';

    const AUTOLOAD_STEP = 20;

    const BUTTONS = [
        { id: 1, label: 'Ядра' },
        { id: 2, label: 'Оценки' },
        { id: 3, label: 'Связи' }
    ]
/*
    const TAGS = [
        { id: 1, label: 'Параллепипед', path: '', weight: '20K' },
        { id: 2, label: 'Счастье', path: '', weight: '150K' },
        { id: 3, label: 'Любовь', path: '', weight: '430K' },
        { id: 4, label: 'Гармония', path: '', weight: '100K' },
        { id: 5, label: 'Дети', path: '', weight: '385K' },
        { id: 6, label: 'Продукты', path: '', weight: '385K' },
        { id: 7, label: 'Животные', path: '', weight: '35K' },
        { id: 8, label: 'Математика', path: '', weight: '8K' },
        { id: 9, label: 'Политика', path: '', weight: '2M' },
        { id: 10, label: 'Обучение', path: '', weight: '1.5M' }
    ] */

    export default {
        name: 'PageMobileSphere',
        components: {
            Beads,
            'node-list': NodeList,
            'sphere-chips': SphereChips,
            Setting
        },
        data () {
        return {
            mode: 1,
            BUTTONS,
/*
            TAGS,
*/
            statusText: 'Свайп пока не работает, для просмотра состояний кликни на визитку',
            test: 'John',

            item: {},
            nodes: [],
        }
    },
    beforeMount () {
        this.sphere.one(this.$route.params.id).then(this.load.bind(this));
    },
    computed: {
        ...mapState('providers', {
                sphere: (state) => state.sphere,
        }),
        isVisible () {
            return this.mode > 0
        },
        sphereOid () {
            /* eslint-disable-next-line */
            return (this.item && this.item.oid) || false;
        }
    },
    methods: {
        toggle () {
            this.mode += 1
            if (this.mode === 2) this.mode = 0
        },
        load(data) {
            console.log('=== LOAD DATA', data);
            this.item = data;
            this.sphere.list(data.oid);
        },
        open (oid) {
            this.$router.push(`/sphere/${oid}`);
        }
    },

    }
</script>

<style lang="stylus">
    .kp-sphere
        display block
        width 100%

        &__header
            display block
            border-bottom 1px solid #c0

        &__visitcard
            display grid
            grid-template-columns 95px auto
            grid-gap 16px
            height 110px
            padding 8px
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

        &__name
            padding-top 8px
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
            padding 4px
            max-height 50px
            overflow auto

        &__chips
            display inline-block
            white-space nowrap
            width auto
            max-height 40px

        &__nodes
            top 160px
            bottom 50px

        &_mode-0
            top 60px

        &__quit
            text-align center
            padding 16px
            border-top 1px solid silver

        &__beads
            position absolute !important
            bottom 0
            left 0
            right 0
</style>
