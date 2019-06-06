<template lang="pug">
    .select-content
        q-dialog(v-model='isVisible')
            q-card
                q-card-section
                    .text-h6 Добавление контента
                q-card-section.sources
                    q-btn.sources__item(v-for="(item,ix) in sources"
                        :key="ix" @click="open(item)" :icon="item.icon" :label="item.label")

                input(type="file" ref="input" hidden)

                q-card-actions
                    q-btn(flat label="Отмена" color="primary" v-close-popup)

        youtube-search(v-if="youtubeVisible" @close="closeYoutube")

</template>

<script>
import YoutubeSearch from 'src/components/create/YoutubeSearch'
const CODE_YOUTUBE = 'youtube';
const CODE_IMAGE = 'image';

export default {
    name: 'SelectContentDialog',
    components: { YoutubeSearch },
    props: {
        model: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isVisible: false,
            youtubeVisible: false,
            sources: [
                { code: CODE_IMAGE, label: 'Выбрать фото', icon: 'photo_library' },
                { code: CODE_YOUTUBE, label: 'Найти ролик на Youtube', icon: 'ondemand_video' },
            ],
        };
    },
    watch: {
        isVisible(val) {
            if (!val) this.$emit('close');
        },
        model(val) {
            this.isVisible = val;
        }
    },
    computed: {
    },
    methods: {
        open(item) {
            if (item.code === CODE_IMAGE) {
                this.$refs.input.click();
            } else if (item.code === CODE_YOUTUBE) {
                this.youtubeVisible = true;
            }
        },
        closeYoutube(videoId) {
            this.youtubeVisible = false;

            if (videoId) {
                this.$emit('close', videoId);
            }
        }
    },
};
</script>

<style lang="stylus">
    .sources
        &__item
            display block
            width 100%
            margin-bottom 8px
            &:last-child
                margin-bottom 0
</style>
