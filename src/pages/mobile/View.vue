<template lang="pug">
    q-page.flex
        q-card.kp-node-view(flat)
            q-item.kp-node-view__header
                q-item-section.kp-avatar(avatar)
                    q-avatar.kp-avatar__image
                        img(:src='authorPic')
                q-item-section
                    q-item-label {{ authorName }}
            .kp-node-view__content
                img(:src='itemSrcRoot')
                //q-video(src='https://www.youtube.com/embed/DxPF_SQLp78?rel=0&controls

            q-item
                q-item-section
                    span.kp-node-view__sense-text {{ itemName }}

            .kp-node-view__content
                img(:src='itemSrcSec')

        .kp-node-view__footer
            .kp-node-view__tags
                q-chip(rounded @click.native="openSphere(item)" v-for="(item,ix) in itemTags" :key="ix")
                    q-avatar(color="blue" text-color="white" font-size="12px") {{ 0 }}
                    | {{ item.name }}
            .kp-node-view__share
                q-btn.kp-node-view__share-btn(flat icon="share" size="lg")
        voter.kp-node-view__voter(:node="node")
</template>

<style lang="stylus">

    .kp
        &-node-view
            max-width 99vw
            margin 0px auto

            &__voter
                display block

            &__header
                padding 0 8px
                max-height 40px !important
                overflow hidden

            &__content
                display block
                min-height 56vw
                max-height 56vw

                & img
                    width 100%
                    height 56vw

            &__footer
                display grid
                grid-template-columns 5fr 1fr

            &__share
                text-align right
                padding 4px
                border-left 1px solid #c0

            &__sense
                position: relative;
                display: block;
                height: 40px;
                width: 300px;
                padding 5px
                background: none
                margin: -20px auto;

                &-text
                    text-align center
                    font-size 20px
                    padding 0
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

<script>
    import { mapState } from 'vuex';
    import voter from '../../components/Voter'

    export default {
        name: 'PageMobileView',
        components: {
            voter
        },
        data () {
            return {
                node: null,
            }
        },
        beforeMount() {
            const self = this;

            this.provider.request(this.$route.params.id).then(data => {
                self.node = data[0];
            })
        },
        computed: {
            ...mapState('providers', { provider: state => state.node }),
            authorName() {
                return (this.node &&
                    this.node.author &&
                    this.node.author.name) || '?';
            },
            authorPic() {
                return (this.node &&
                    this.node.author &&
                    this.node.author.thumbUrl) || '';
            },
            itemName() {
                const { node } = this;

                return (node && node.name) || '?';
            },
            itemSrcRoot() {
                const { node } = this;

                return (node && node.fragmentRoot &&
                    node.fragmentRoot.content &&
                    node.fragmentRoot.content.thumbUrl) || '';
            },
            itemSrcSec() {
                const { node } = this;

                return (node && node.fragmentSecondary &&
                    node.fragmentSecondary.content &&
                    node.fragmentSecondary.content.thumbUrl) || '';
            },
            itemTags() {
                    const { node } = this;

                    return (node && node.hashTags) || [];
            },
        },
        methods: {
            openSphere (item) {
                this.$router.push(`/sphere/${item.oid}`)
            }
        }
    }
</script>
