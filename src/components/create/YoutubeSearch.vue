<template lang='pug'>
    q-page.youtube-search()
        q-input(square filled v-model='search' label='Поиск по ютубу' maxlength='50' autofocus @keyup.enter="requestYoutube")
            template(v-slot:prepend)
                q-icon(name='search')
            template(v-slot:append)
                q-icon(name='close' @click='clearOrClose')
        q-card.youtube-search__results(flat)
            youtube-item(v-for='(item, ix) in result' :key='ix' :item='item' @click.native="select(item)")
</template>

<script>
    import YoutubeItem from 'src/components/create/YoutubeItem';
    import axios from 'axios';
    // import gapi from 'gapi';

    const API_KEY_YOUTUBE = 'AIzaSyAOr9KyztPu3SFX5wnXAZ2o-ry2uwa-R5Y';

    export default {
        name: 'YoutubeSearch',
        components: { YoutubeItem },
        data() {
            return {
                search: '',
                result: [],
                youtube: null,
            }
        },
        beforeMount() {
            /*
            gapi.load('client:auth2', () => {
                gapi.auth2.init({ client_id: API_KEY_YOUTUBE });

                this.youtube = gapi.auth2.getAuthInstance()
                    .signIn({ scope: 'https://www.googleapis.com/auth/youtube.readonly' })
                    .then(this.loadYoutubeClient);
            });
            */
        },
        watch: {
            search(val, old) {
                if (val !== old) {
                    this.initSearchTimer();
                }
            }
        },
        methods: {
            /*
            loadYoutubeClient() {
                gapi.client.load('https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest')
            },
            */
            clearOrClose() {
                if (this.search) {
                    this.search = '';
                    this.result = [];
                } else {
                    this.$emit('close');
                }
            },
            initSearchTimer() {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.timer = null;
                }

                this.timer = setTimeout(this.requestYoutube.bind(this), 1000);
            },
            requestYoutube() {
                const params = {
                    maxResults: 50,
                    part: 'snippet',
                    videoType: 'any',
                    type: 'video',
                    q: encodeURIComponent(this.search),
                    key: API_KEY_YOUTUBE,
                };

                clearTimeout(this.timer);
                this.timer = null;
                this.result = [];

                axios.get('https://www.googleapis.com/youtube/v3/search', { params }).then(({ data }) => {
                    data.items.forEach(el => {
                        const item = {
                            etag: el.etag,
                            id: el.id.videoId,
                            channelId: el.snippet.channelId,
                            channelTitle: el.snippet.channelTitle,
                            title: el.snippet.title,
                            description: el.snippet.description,
                            thumbnails: el.snippet.thumbnails
                        };

                        // console.log('=== PUSHING ', item);
                        this.result.push(item);
                    })
                })
            },
            select(item) {
                this.$emit('close', item.id);
            }
        }
    }
</script>

<style lang='stylus'>
    .youtube-search
        background #f
        position fixed
        top 0
        left 0
        right 0
        bottom 0
        z-index 7000

        &__results
            padding 6px
            overflow auto
            position fixed
            top 55px
            bottom 0
            left 0
            right 0
            overflow auto
</style>
