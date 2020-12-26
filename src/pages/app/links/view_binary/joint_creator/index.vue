<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  //- joint name/vertices
  div(
    :style=`{
      position: 'absolute', zIndex: 1001, top: '-30px',
      height: '60px',
    }`
    ).row.full-width.bg-black
  //- footer
  div(
    :style=`{
      position: 'absolute', zIndex: 1001, bottom: -60-34+'px',
      height: 60+'px',
    }`
    ).row.full-width.bg-black
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="cancel()")
          .col
            q-btn(
              @click="publish()"
              color="green" no-caps
              :loading="publishing"
              ).full-width
              span.text-white.text-bold Publish
          q-btn(round flat color="white" icon="more_vert")
  //- add placeholder
  q-btn(
    flat color="green" icon="add" size="lg"
    ).fit.b-40
  //- editor/previewer
</template>

<script>
export default {
  name: 'jointCreator',
  data () {
    return {
      publishing: false
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel')
      // TODO: ask for save
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(500)
        this.$log('publish done')
        this.publishing = false
        let createdNode = null
        this.$emit('published', createdNode)
        this.cancel()
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
  }
}
</script>
