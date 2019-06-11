<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(ref="kheader" :style=`{height: $store.state.ui.width+'px', borderBottom: '1px solid #eee'}`).column.full-width.kheader
    //- header
    div(v-if="type !== 'youtube'" style=`height: 60px`).row.full-width.items-center.justify-end
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
    //- body
    .col
      .row.fit.items-center.content-center
        .row.full-width
          .col.q-pl-sm
            q-input(v-model="input" @input="handleInput" @keyup.enter="startSearch"
              filled placeholder="Поиск"
              :class="{'q-pr-sm': type !== 'youtube'}").fit
              template(v-slot:prepend)
                q-icon(name="search")
              template(v-slot:append)
                //- q-btn(round flat icon="clear" color="primary" v-if="input.length > 0")
                q-btn(no-caps color="primary" v-if="input.length > 0" @click="startSearch") Найти
          div(v-if="type === 'youtube'" style=`height: 60px; width: 60px`).row.items-center.justify-center
            q-btn(flat round icon="clear" @click="cancelClick" color="primary")
        div(v-if="type === 'local'").row.full-width.justify-center
          small.text-center.text-grey-8.q-my-sm Найди видео или вставь ссылку из YouTube
  //- videos list
  div(style=`overflowX: hidden`).col.scroll.bg-grey-2
    //- from yotube link
    source-link(v-if="type === 'link'" type="youtube" :link="input"
      @video="$event => $emit('video', $event)"
      @close="$emit('close')")
    //- from youtube search
    source-youtube(v-else-if="type === 'youtube'"
      :search="search"
      @video="$event => $emit('video', $event)"
      @close="$emit('close')")
    //- local on device
    source-local(v-else-if="type === 'local'")
    //- loading
    div(v-else-if="type === 'loading'").row.fit.items-center.justify-center
      q-spinner(size="50px")
    //- nothing
    div(v-else style=`height: 60px`).row.full-width.items-center.justify-center
      span Nothing found!
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
