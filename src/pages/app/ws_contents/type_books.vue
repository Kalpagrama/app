<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px', minHeight: '100vh'}`).row.full-width.items-start.content-start
    //- masonry(
    //-   :cols="$q.screen.width < 800 ? Math.round($q.screen.width/200) : 5"
    //-   :gutter="{default: 10}")
    div(
        v-for="(i,ii) in 16" :key="ii"
        :style=`{
          height: '150px',
          width: '100px',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.items-start.content-start.q-mb-sm.q-px-md.q-py-lg.b-40.q-mr-sm.q-mb-sm
        .row.full-width.q-py-md
          div(:style=`{height: '4px', borderRadius: '2px',}`).row.full-width.b-50
          .row.full-width.q-pa-md
            div(:style=`{height: '4px', borderRadius: '2px',}`).row.full-width.b-50
</template>

<script>
export default {
  name: 'wsContents_typeBooks',
  data () {
    return {
    }
  }
}
</script>
