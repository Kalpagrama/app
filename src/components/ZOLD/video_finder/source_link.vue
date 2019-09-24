<template lang="pug">
.column.fit
  div(:style=`{zIndex: 100, minHeight: '70px', height: headerHeight+'px'}`).row.full-width.items-center.content-center.q-px-sm
    .col
      q-input(v-model="link" filled :placeholder="$t('Найдите видео или вставьте ссылку на видео')" :loading="loading" @keyup.enter="startSearch()" autofocus).full-width
        template(v-slot:append)
          q-btn(v-if="!loading && link.length > 0" round flat dense icon="clear" @click="cancelSearch()")
    q-btn(style=`height: 56px` color="primary" @click="startSearch()" :loading="loading" no-caps).q-ml-sm {{$t('Найти')}}
  div(v-if="linkValidated").col.scroll
    q-resize-observer(@resize="onResize")
    div(:style=`{height: width*0.56+'px'}`).row.full-width.q-px-sm
      div(style=`borderRadius: 4px; overflow: hidden`).row.fit
        iframe(
          v-if="linkValidated"
          width="100%"
          height="100%"
          :src="getLink"
          frameborder="0"
          autoplay
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen)
        div(v-else).row.fit.bg-grey-3
    //- video actions
    .row.full-width.justify-end.q-my-sm.q-px-sm
      q-btn(style=`height: 50px; borderRadius: 4px` flat color="primary" no-caps @click="cancelSearch()").q-mr-sm {{$t('cancel')}}
      q-btn(style=`height: 50px; borderRadius: 4px` color="primary" @click="videoSelect({})" no-caps) {{$t('choose_video')}}
</template>

<script>
export default {
  name: 'videoFind__sourceLink',
  data () {
    return {
      link: '',
      linkValidated: false,
      loading: false,
      width: 600,
      headerHeight: 400
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
    },
    async startSearch () {
      try {
        this.$log('search start')
        this.loading = true
        // await this.$wait(1000)
        let link = await this.linkValidate(this.link)
        if (link) {
          this.$log('link', link)
          this.$tween.to(this, 0.33, {headerHeight: 70})
          this.$log('search URL')
        } else {
          this.$log('search YOUTUBE')
        }
        this.$log('search done')
        this.loading = false
      } catch (error) {
        this.$log('search error', error)
        this.loading = false
      }
    },
    cancelSearch () {
      this.$log('cancelSearch')
      this.link = ''
      this.linkValidated = false
      this.$tween.to(this, 0.33, {headerHeight: 400})
    },
    linkValidate (link) {
      try {
        // this.$log('linkValidate')
        let l = new URL(link)
        return l
      } catch (e) {
        return false
      }
    },
    videoSelect () {
      this.$log('videoSelect')
      let v = {url: this.link}
      let options = {type: 'VIDEO', source: 'from_link'}
      // TODO: ask really choose this video?
      this.$emit('ready', {...v, ...options})
    }
  },
  computed: {
    getLink () {
      let id = ''
      let arr = this.link.split('/')
      if (arr[arr.length - 2] === 'embed') {
        id = arr[arr.length - 1]
      } else {
        let s = this.link.split('=')
        id = s[1]
      }
      return `https://www.youtube.com/embed/${id}`
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
