<template lang="pug">
.column.fit
  div(:style=`{zIndex: 100, minHeight: '70px', height: headerHeight+'px'}`).row.full-width.items-center.content-center.q-px-sm
    .col
      q-input(v-model="link" filled :label="$t('paste_link_here')" :loading="loading" @keyup.enter="startSearch()" autofocus).full-width
        template(v-slot:append)
          q-btn(v-if="!loading" round flat dense icon="clear" @click="cancelSearch()")
    q-btn(style=`height: 56px` color="primary" @click="startSearch()" :loading="loading").q-ml-sm {{$t('find')}}
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
        this.loading = true
        await this.$wait(1000)
        await this.linkValidate()
        this.$tween.to(this, 0.33, {headerHeight: 70})
        this.loading = false
      } catch (error) {
        this.loading = false
      }
      this.$log('startSearch')
    },
    cancelSearch () {
      this.$log('cancelSearch')
      this.link = ''
      this.linkValidated = false
      this.$tween.to(this, 0.33, {headerHeight: 400})
    },
    linkValidate () {
      this.$log('linkValidate')
      this.linkValidated = true
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
