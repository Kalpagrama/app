<template lang="pug">
    .content-creator
        .content-creator__controls(v-if="isEmpty")
            q-btn(round icon="add" outline color="black" @click="$emit('create')")
        q-video(v-if="item && item.videoId" :src="getVideoUrl(item)")
</template>

<script>
export default {
    name: 'ContentCreator',
    props: {
        item: {
            type: Object,
            default: null,
        }
    },
    data() {
     return {};
    },
    computed: {
        isEmpty() {
            const { videoId, imageSrc } = this.item;

            return !(videoId || imageSrc);
        }
    },
    methods: {
        getVideoUrl(item) {
            if (item && item.videoId) {
                return `https://www.youtube.com/embed/${item.videoId}?rel=0&amp;enablejsapi=1&amp;showinfo=0&amp;};`
            }

            return '';
        }
    },
};
</script>

<style lang="stylus">
    .content-creator
        position relative
        display grid
        grid-template-columns 1fr
        grid-template-rows 1fr
        width 100vw
        height 56vw
        border 1px dashed silver
        backgroud #f0
        overflow hidden
        &__controls
            align-self center
</style>
