<template lang="pug">
.column.fit
  div(
    :style=`{height: '60px'}`
    ).row.full-width.items-center.content-center
    .col.full-height
      .row.fit.items-center.content-center.q-px-md
        span.text-bold.text-green Node editor
    div(
      :style=`{height: '60px', width: '60px'}`
      ).row.items-center.content-center.justify-center
      q-btn(round flat icon="refresh" color="green" @click="refresh()")
  .col.br
    composition-editor
  div(:style=`{height: '60px'}`).row.full-width
  .col.br
    composition-editor
</template>

<script>
import compositionEditor from 'components/node/composition_editor'

export default {
  name: 'nodeEditor',
  components: {compositionEditor},
  data () {
    return {
    }
  },
  methods: {
    async save () {
      this.$log('save')
    },
    async publish () {
      this.$log('publish')
    },
    async refresh () {
      this.$log('refresh')
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
