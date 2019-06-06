<template lang="pug">
    .content
        q-video.content__video(v-if="isVideo" :src="srcUrl")
        img.content__image(v-if="isImage" :src="srcUrl")
        .content__empty(v-if="!fragment") Пусто
</template>

<script>
    const TYPE_VIDEO = 'VIDEO';
    const TYPE_IMAGE = 'IMAGE';

    export default {
        name: 'NodeContent',
        props: {
            fragment: {
                type: Object,
                default: null,
            }
        },
        computed: {
            isVideo() {
                return this.isType(TYPE_VIDEO);
            },
            isImage() {
                return this.isType(TYPE_IMAGE);
            },
            srcUrl() {
                return this.fragment && this.fragment.contentDetails && this.fragment.contentDetails.url;
            }
        },
        methods: {
            isType(type) {
                return this.fragment && this.fragment.contentDetails.type === type;
            },
        }
    }
</script>

<style lang="stylus">
    .content
        background silver
        &__video
        &__image
            height: 210px;
</style>
