<template lang="pug">
div(style=`maxWidth: 540px`).column.fit.bg-white
  //- header
  //- div(:style=`{height: '76px', borderBottom: '1px solid #eee'}`).row.full-width.justify-center
  //-   div(style=`maxWidth: 1110px`).row.full-width
  //-     .col.q-pl-sm
  //-       q-input(v-model="input" @input="handleInput" @keyup.enter="startSearch"
  //-         filled placeholder="Поиск").fit
  //-         template(v-slot:prepend)
  //-           q-icon(name="search")
  //-         template(v-slot:append)
  //-     div(style=`height: 76px; width: 76px`).row.items-center.justify-center
  //-       q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
  //- body
  div(style=`overflowX: hidden`).col.scroll.bg-grey-2
    .row.full-width
      .col
        span Image
      .col
        span Video
    .row.full-width
      div(:style=`{height: getHeight+'px'}`).col-3.hr.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          q-icon(name="fab fa-youtube" size="50px" color="grey")
          .row.full-width.justify-center
            span From camera
      div(:style=`{height: getHeight+'px'}`).col-3.hr.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          q-icon(name="fab fa-youtube" size="50px" color="grey")
          .row.full-width.justify-center
            span From device
      div(:style=`{height: getHeight+'px'}`).col-3.hr.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          q-icon(name="fab fa-youtube" size="50px" color="red")
          .row.full-width.justify-center
            span Find in YouTube
      div(:style=`{height: getHeight+'px'}`).col-3.hr.cursor-pointer
        .row.fit.items-center.content-center.justify-center
          q-icon(name="fab fa-youtube" size="50px" color="red-5")
          .row.full-width.justify-center
            span Paste link
    //- .row.full-width.justify-center
    //-   div(style=`maxWidth: 1110px`).row.full-width
    //-     //- from yotube link
    //-     source-link(v-if="type === 'link'" type="youtube" :link="input"
    //-       @video="$event => $emit('video', $event)"
    //-       @close="$emit('close')")
    //-     //- from youtube search
    //-     source-youtube(v-else-if="type === 'youtube'"
    //-       :search="search"
    //-       @video="$event => $emit('video', $event)"
    //-       @close="$emit('close')")
    //-     //- local on device
    //-     source-local(v-else-if="type === 'local'")
    //-     //- loading
    //-     div(v-else-if="type === 'loading'").row.fit.items-center.justify-center
    //-       q-spinner(size="50px")
    //-     //- nothing
    //-     div(v-else style=`height: 60px`).row.full-width.items-center.justify-center
    //-       span Nothing found!
</template>

<script>
import sourceLink from './source_link'
import sourceYoutube from './source_youtube'
import sourceLocal from './source_local'
export default {
  name: 'videoFind',
  components: { sourceLink, sourceYoutube, sourceLocal },
  data () {
    return {
      input: '',
      search: '',
      type: 'local',
      types: ['link', 'local', 'youtube', 'loading']
    }
  },
  computed: {
    getHeight () {
      let w = this.$q.screen.width
      if (w > 540) {
        return 540 / 4
      } else {
        return w / 4
      }
    }
  },
  methods: {
    handleInput (e) {
      this.$log('handleInput', e)
    },
    startSearch () {
      this.$log('startSearch')
      this.type = 'loading'
      // check for youtube, vimeo, vk and other sources of link
      let check = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
      if (check.test(this.input)) {
        this.$log('YOUTUBE link')
        this.type = 'link'
      } else {
        this.$log('go to find...')
        this.type = 'youtube'
        this.search = this.input
      }
    },
    cancelClick () {
      this.$log('cancelClick')
      this.type = 'local'
      this.input = ''
      this.search = ''
    }
  },
  watch: {
    type: {
      handler (to, from) {
        if (to === 'youtube') {
          this.$tween.to('.kheader', 0.5, {height: '70px'})
        }
      }
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
