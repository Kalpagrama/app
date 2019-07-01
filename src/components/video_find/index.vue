<template lang="pug">
.row.full-width
  div(v-if="source === 'camera'").row.fit.items-center.justify-center
    source-camera
  div(v-else-if="source === 'device'").row.fit.items-center.justify-center
    source-device
  div(v-else-if="source === 'youtube'").row.fit.items-center.justify-center
    source-youtube(@select="$event => $emit('select', $event)")
  div(v-else-if="source === 'link'").row.fit.items-center.justify-center
    source-link
  div(v-else-if="source === 'workspace'").row.fit.items-center.justify-center
    source-workspace
  div(v-else).row.fit.items-center.justify-center
    span {{$t('no_such_source')}}
</template>

<script>
import sourceCamera from './source_camera'
import sourceDevice from './source_device'
import sourceYoutube from './source_youtube'
import sourceLink from './source_link'
import sourceWorkspace from './source_workspace'

export default {
  name: 'videoFind',
  props: {
    source: {type: String, required: true}
  },
  components: { sourceCamera, sourceDevice, sourceYoutube, sourceLink, sourceWorkspace },
  data () {
    return {
      sources: ['camera', 'device', 'youtube', 'link', 'workspace']
    }
  },
  computed: {
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
