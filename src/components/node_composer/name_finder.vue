<template lang="pug">
div(@click.self="$emit('hide')").row.fit.items-end
  div(:style=`{height: height-200+'px', borderRadius: '10px 10px 0 0'}`).column.full-width.q-pa-sm.bg-grey-3
    .row.full-width
      div(:style=`{height: '60px', borderRadius: '10px'}`).row.full-width.bg-white
    .col.full-width.scroll
      .row.full-width.items-start.content-start.q-px-sm
        div(
          v-for="(s, si) in 20" :key="si"
          :style=`{minHeight: '40px'}`
          ).row.full-width.items-center.justify-center.q-px-sm
          span Suggestion {{ s }}
</template>

<script>
export default {
  name: 'nameFinder',
  data () {
    return {}
  }
}
</script>