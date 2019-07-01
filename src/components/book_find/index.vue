<template lang="pug">
.row.full-width
  source-device(v-if="source === 'device'")
  source-link(v-else-if="source === 'link'")
  source-workspace(v-else-if="source === 'workspace'")
  div(v-else).row.fit.items-center.justify-center
    span {{$t('no_such_source')}}
</template>

<script>
import sourceDevice from './source_device'
import sourceLink from './source_link'
import sourceWorkspace from './source_workspace'

export default {
  name: 'bookFind',
  components: {sourceDevice, sourceLink, sourceWorkspace},
  props: {
    source: {type: String, required: true}
  },
  data () {
    return {
      sources: ['device', 'link', 'workspace']
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
