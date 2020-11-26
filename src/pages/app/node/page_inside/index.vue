<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: pageHeight+'px'
  }`
  ).row.full-width.justify-center
  //- slot(name="prepend")
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.items-start.content-start.q-pa-sm
    slot(name="body")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'node_pageInside',
  props: ['node', 'pageHeight', 'pageWidth'],
  components: {
    // creator: () => import('./create.vue'),
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
      return res
    },
  },
}
</script>
