<template lang="pug">
q-page
  .row.full-width.justify-center
    //- div(
      :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
      ).row.full-width.q-px-md
      div(
        v-for="(t,ti) in joints" :key="t.oid"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.q-mb-sm
        img(
          :src="t.items[1].thumbUrl"
          :style=`{
            width: '50px', height: '50px', objectFit: 'cover',
            borderRadius: '10px'
          }`
          )
        .col
          .row.fit.items-center.content-center.q-pa-sm
            small.text-white {{t.name || t.vertices}}
    div(
      :style=`{
        paddingLeft: '50%',
      }`
      ).row.full-width.scroll
      div(
        :style=`{
          //- marginRight: '400px',
        }`
        ).row.no-wrap
        div(
          v-for="(t,ti) in joints" :key="t.oid"
          :style=`{
            minWidth: width+'px',
            maxWidth: width+'px',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-px-sm
            div(
              :style=`{
                height: '60px',
                borderRadius: '10px',
                maxWidth: '80%',
              }`
              ).row.full-width.b-40.q-mb-sm
            img(
              :src="t.items[1].thumbUrl"
              :style=`{
                borderRadius: '10px',
              }`
              ).full-width
</template>

<script>
export default {
  name: 'viewThreads',
  props: ['joint', 'joints'],
  computed: {
    width () {
      return Math.min(this.$store.state.ui.pageWidth, this.$q.screen.width)
    }
  },
}
</script>
