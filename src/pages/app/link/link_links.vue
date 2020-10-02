<template lang="pug">
.row.full-width.items-start.content-start.q-pr-sm
  masonry(
    :cols="5"
    :gutter="{default: 10}").full-width.q-pr-sm
    div(
      v-for="n in 10" :key="n"
      :style=`{
        position: 'relative',
        height: 0, paddingBottom: '150%',
      }`).row.full-width.q-pa-xs.q-mb-md
      div(
        :style=`{
          position: 'absolute',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.fit.items-center.content-center.justify-center.b-40
        small.text-white link {{ n }}
</template>

<script>
export default {
  name: 'pageApp_link_linkLinks',
  data () {
    return {
    }
  }
}
</script>
