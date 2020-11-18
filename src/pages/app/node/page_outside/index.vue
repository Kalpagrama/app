<template lang="pug">
q-page(
  :style=`{
    paddingBottom: '50px',
  }`
  )
  q-page-sticky(
    expand
    position="top"
    :style=`{
      zIndex: 4000
    }`).b-30
    slot(name="top")
  q-page-sticky(
    expand
    position="bottom"
    :style=`{
      zIndex: 4000,
      borderRadius: '10px 10px 0 0',
      overflow: 'hidden'
    }`).b-30
    slot(name="bottom")
  .row.full-width
    slot(name="body")
    //- kalpa-loader(
      :immediate="true"
      :query="query" :limit="15" v-slot=`{items,next,nexting}`)
      .row.full-width.items-start.content-start.justify-center
        div(
          v-for="(joint,jointi) in items" :key="ni"
          :style=`{
            height: pageHeight+'px'
          }`
          ).row.full-width
          joint(:joint="joint" :oid="node.oid")
    //- create your joint
    //- div().row.full-width.q-pa-sm
      //- q-btn(
        flat color="green" icon="add"
        :style=`{height: '100px',}`
        ).full-width.b-40
      //- q-input(
        v-model="name"
        bordered
        ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'node_pageOutside',
  props: ['node', 'pageHeight', 'pageWidth'],
  components: {
    joint: () => import('./joint.vue'),
  },
  data () {
    return {
      name: ''
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
          oidSphere: this.node.oid,
          // jointItemType: {$in: ['NODE', 'WORD']},
          // sortStrategy: 'AGE',
          // sortOrder: 'ASC' // DESC
        },
        populateObjects: true,
      }
    }
  }
}
</script>
