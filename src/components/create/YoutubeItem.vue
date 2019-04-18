<template lang="pug">
    .youtube-item(v-if="item")
        .youtube-item__video
            img(:src="thumbUrl")
        .youtube-item__info
            .text-left {{ item.title }}
</template>

<script>
    export default {
        name: 'YoutubeItem',
        props: {
            item: {
                type: Object,
                default: () => ({}),
            }
        },
        computed: {
            thumbUrl() {
                console.log('=== ', this.item);
                return this.item.thumbnails.default.url
            }
        }
    }
</script>

<style lang="stylus">
    .youtube-item
        display grid
        grid-template-columns 120px auto
        grid-gap 16px
        width 100%
        max-height 90px
        overflow hidden
        margin-bottom 8px

        &:hover
            background #f0

        &__video
            min-height 100px
            background silver

</style>
