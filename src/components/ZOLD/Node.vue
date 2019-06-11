<template lang="pug">
    q-card.kp-node(@click="open")
        q-item.kp-node__header
            q-item-section.kp-avatar(avatar)
                q-avatar.kp-avatar__image
                    img(:src='authorPic()')
            q-item-section
                q-item-label {{ authorName() }}
        .kp-node__preview
            img(:src='item.thumbUrl')

        .kp-node__sense
            span.kp-node__sense-text.shadow-4 {{ item.name }}

        //.kp-node__content
            img(:src='randomImage(1)')

        q-item-section.kp-node__footer
            .text-left
                q-chip(dense disable icon='remove_red_eye' size='10px' color='white') {{ item.viewed | format }}
            .text-center
                q-chip.text-center(dense disable icon='star_border' size='10px' color='white') {{ item.rate | rate }}
            .text-right
                q-chip.text-right(dense disable icon='link' size='10px' color='white') {{ item.chainCnt | format }}
</template>

<script>
    export default {
        name: 'Node',
        props: {
            item: {
                type: Object,
                default: () => ({})
            },
            ix: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {}
        },
        computed: {},
        methods: {
            authorName() {
                return (this.item &&
                    this.item.author &&
                    this.item.author.name) || '?';
            },
            authorPic() {
                return (this.item &&
                    this.item.author &&
                    this.item.author.thumbUrl) || '';
            },
            open () {
                this.$router.push('/view/' + this.item.oid);
            }
        }
    }
</script>

<style lang="stylus">
    .kp
        &-node
            max-width 99vw
            margin 6px auto
            border 1px solid #d0

            &__header
                padding 0 8px
                max-height 40px !important
                overflow hidden

            &__content
                display block
                min-height 56vw
                max-height 56vw

            &__preview
                display block
                min-height 112vw
                max-height 112vw
                overflow hidden

                & img
                    width 100%
                    height 112vw

            &__footer
                display grid
                grid-template-columns 1fr 1fr 1fr

            &__sense
                position: relative;
                display: block;
                height: 40px;
                width: 300px;
                padding 5px
                background: none
                margin: -20px auto;
                text-align center
                top -210px

                &-text
                    font-size 20px
                    padding: 8px 16px
                    background white
                    border-radius 6px

        &-avatar
            min-width 40px
            max-width 40px
            margin-right 8px
            overflow hidden

            &__image
                width 28px
                height 28px

</style>
