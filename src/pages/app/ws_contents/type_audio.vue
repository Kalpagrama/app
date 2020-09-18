<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '600px', minHeight: '100vh'}`).row.full-width.q-px-sm
    div(
      v-for="n in 16" :key="n"
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.b-40.q-mb-sm.q-pa-md
      q-btn(round flat color="grey-8" icon="play_arrow")
      .col.q-px-sm
        div(:style=`{height: '4px', borderRadius: '2px', overflow: 'hidden'}`).row.full-width.b-50
</template>

<script>
export default {
  name: 'wsContents_typeAudio',
  data () {
    return {
    }
  }
}
</script>
