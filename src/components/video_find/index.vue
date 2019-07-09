<template lang="pug">
.row.full-width
  component(v-if="sources.includes(source)" :is="`source-${source}`" @ready="handleReady")
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
    handleReady (e) {
      this.$log('handleReady', e)
      let options = {type: 'VIDEO'}
      this.$emit('ready', {...e, ...options})
      // this.$emit('close')
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
