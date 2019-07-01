<template lang="pug">
.row.fit
  source-camera(v-if="source === 'camera'")
  source-device(v-else-if="source === 'device'")
  source-google(v-else-if="source === 'google'")
  source-link(v-else-if="source === 'link'")
  source-workspace(v-else-if="source === 'workspace'")
  div(v-else).row.fit.items-center.justify-center
    span {{$t('no_such_source')}}
</template>

<script>
import sourceCamera from './source_camera'
import sourceDevice from './source_device'
import sourceGoogle from './source_google'
import sourceLink from './source_link'
import sourceWorkspace from './source_workspace'

export default {
  name: 'imageFind',
  props: {
    source: {type: String, required: true}
  },
  components: {sourceCamera, sourceDevice, sourceGoogle, sourceLink, sourceWorkspace},
  data () {
    return {
      sources: ['camera', 'device', 'google', 'link', 'workspace']
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
