<template lang="pug">
.column.fit.bg-white
  //- header with animated height
  div(ref="kheader" :style=`{height: $store.state.ui.width+'px', borderBottom: '1px solid #eee'}`).column.full-width.kheader
    //- header
    div(v-if="type !== 'list'" style=`height: 60px`).row.full-width.items-center.justify-end
      div(style=`height: 60px; width: 60px`).row.items-center.justify-center
        q-btn(flat round dense icon="clear" color="primary" @click="$emit('close')")
    //- body
    .col
      .row.fit.items-center.content-center
        .row.full-width
          .col.q-pl-sm
            q-input(v-model="input" @input="handleSearch"
              filled placeholder="Найди видео или вставь ссылку"
              :class="{'q-pr-sm': type !== 'list'}" :debounce="600").fit
              template(v-slot:prepend)
                q-icon(name="search")
          div(v-if="type === 'list'" style=`height: 60px; width: 60px`).row.items-center.justify-center
            q-btn(flat round icon="clear" @click="cancelClick" color="primary")
        div(v-if="type === 'local'").row.full-width.justify-center
          small.text-center.text-grey-8.q-my-sm из YouTube, Вконаткте или Vimeo
  //- videos list
  div(style=`overflowX: hidden`).col.scroll.bg-grey-2
    source-link(v-if="type === 'link'" type="youtube" :link="input" @video="$event => $emit('video', $event)")
    list(v-else-if="type === 'list'"
      :search="search"
      @video="$event => $emit('video', $event)"
      @close="$emit('close')")
    local(v-else-if="type === 'local'")
    div(v-else-if="type === 'loading'").row.fit.items-center.justify-center
      q-spinner(size="50px")
    div(v-else).row.fit.items-center.justify-center
      span No type!
</template>

<script>
import sourceLink from './source_link'
import list from './list'
import local from './local'
export default {
  name: 'videoFind',
  components: { sourceLink, list, local },
  data () {
    return {
      input: '',
      search: '',
      type: 'local',
      types: ['link', 'local', 'list', 'loading']
    }
  },
  methods: {
    handleSearch (e) {
      this.$log('handleSearch', e)
      this.type = 'loading'
      // check for youtube, vimeo, vk and other sources of link
      let check = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/
      if (check.test(e)) {
        this.$log('YOUTUBE link')
        this.type = 'link'
      } else {
        this.$log('go to find...')
        this.type = 'list'
        this.search = e
      }
    },
    cancelClick () {
      this.$log('cancelClick')
      this.type = 'local'
    }
  },
  watch: {
    type: {
      handler (to, from) {
        if (to === 'list') {
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
