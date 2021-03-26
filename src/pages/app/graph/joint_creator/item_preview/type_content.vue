<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start
    img(
      :src="url"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
    //- footer
    .row.full-width.items-center.content-center.no-wrap.q-pa-sm
      q-icon(name="select_all" color="white" size="36px").q-mr-sm
      span(:style=`{lineHeight: 1.2}`).text-white {{ item.name }}
</template>

<script>
import { ContentApi } from 'src/api/content'

export default {
  name: 'typeContent',
  props: ['item', 'isActive'],
  data () {
    return {
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.item) },
  }
}
</script>
