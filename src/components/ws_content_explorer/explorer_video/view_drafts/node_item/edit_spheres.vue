<template lang="pug">
q-btn(
  @click="start()"
  round flat dense color="grey-6" icon="add")
  q-dialog(v-model="dialogOpened" position="bottom")
    q-layout(view="hHh Lpr lff").b-30
      q-header(reveal).row.full-width.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.br
          div(:style=`{height: '50px'}`
            ).row.full-width.items-center.content-center
            span.text-white Find sphere
      q-page-container
        q-page
          .row.full-width.justify-center
            div(:style=`{maxWidth: '800px', minWidth: '800px',}`).row.full-width.items-start.content-start.b-30
              h1.text-white spheres...
</template>

<script>
export default {
  name: 'nodeItem_editSpheres',
  props: ['node', 'player'],
  data () {
    return {
      dialogOpened: false,
    }
  },
  methods: {
    start () {
      this.$log('start')
      this.dialogOpened = true
    }
  }
}
</script>
