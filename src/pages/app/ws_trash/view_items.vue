<template lang="pug">
q-page(
  :style=`{
    paddingTop: 0+paddingTop+'px',
  }`
  ).row.full-width.justify-center.q-px-sm
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.q-px-sm
      slot(name="top")
  kalpa-loader(
    :immediate="true"
    :query="queryItems" :limit="10000"
    v-slot=`{items,next}`)
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
      div(
        v-for="(i,ii) in items" :key="ii"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.q-py-sm.q-px-md.q-mb-sm.b-40
        span.text-white {{ i.name }}
        .row.full-width
          small.text-grey-6 {{ i.wsItemType }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsTrash_viewItems',
  props: {
    paddingTop: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  },
  computed: {
    queryItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          deletedAt: {$exists: true}
        }
      }
      return res
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
