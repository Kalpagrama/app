<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px', minHeight: '100vh'}`).row.full-width.items-start.content-start.q-px-xs
    div(
        v-for="(i,ii) in 16" :key="ii"
        :style=`{
        }`
        ).col-4.q-px-xs.q-mb-sm
        div(
          :style=`{
            position: 'relative', zIndex: 100,
            height: 0, paddingBottom: '150%',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.b-40.q-pa-md
          div(:style=`{height: '10px', borderRadius: '5px',}`).row.full-width.b-50
          .row.full-width.q-pa-md
            div(:style=`{height: '10px', borderRadius: '5px',}`).row.full-width.b-50
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
