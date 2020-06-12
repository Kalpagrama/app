<template lang="pug">
.row.fit.justify-center
  div(:style=`{maxWidth: '600px'}`).column.fit
    //- header
    .row.full-width.q-px-sm
      div(v-if="false").row.full-width.q-py-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Explore
    //- body
    .col.full-width.scroll
      div(:style=`{paddingTop: '46px', paddingBottom: '200px',}`).row.full-width.items-start.content-start.q-py-md
        div(
          v-for="i in 10" :key="i"
          :style=`{height: '300px', borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.q-mb-lg.b-60
</template>

<script>
export default {
  name: 'metaSpheres',
  data () {
    return {
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
