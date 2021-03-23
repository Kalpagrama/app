<template lang="pug">
kalpa-layout()
  //- template(v-slot:header)
  template(v-slot:body)
    .row.full-width.items-start.content-start
      .row.full-width.justify-center
        div(
          :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
          ).row.full-width.items-center.content-center.q-pa-sm
          q-btn(
            round flat color="white" icon="west"
            @click="$routerKalpa.back()"
            ).q-mr-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ $t('Collections') }}
    .row.full-width.bg
      h1(v-if="collectionsRes").text-white collectionsRes.items
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageCollections',
  data () {
    return {
      collectionRes: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION,
        },
        limit: 10,
        sort: [{createdAt: 'desc'}]
      }
      return res
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
