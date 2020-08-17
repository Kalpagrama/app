<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- left line, like metropolitan
  div(:style=`{position: 'absolute', zIndex: 100, left: '10px',}`).column.full-height.q-px-sm.q-pt-md
    div(:style=`{position: 'relative', width: '6px', borderRadius: '3px',}`).row.full-height.bg-grey-4
  chain-creator(:node="node")
  //- chain top
  div(:style=`{position: 'relative', zIndex: 100, paddingLeft: '40px', paddingTop: '0px',}`).row.full-width
    //- chain point
    div(
      :style=`{
        position: 'absolute', zIndex: 100, left: '1px', top: '0px',
        width: '40px', height: '40px',
      }`
      ).row.items-center.content-center.justify-center
      div(
        :style=`{
          width: '26px', height: '26px',
          borderRadius: '50%', overflow: 'hidden',
        }`
        ).row.bg-grey-2
    //- chain top label
    div(:style=`{height: '30px',}`).row.full-width.items-end.content-end
      span.text-white.text-bold Причина
    //- chain top node wrapper
    node(v-if="node" ctx="list" :node="node" :needFull="false" :visible="true" :active="false" :mini="false")
  //- chains of the bottom
  div.col.full-width
    .column.fit
      .col.full-width.scroll.q-pt-sm
        kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
          template(v-slot=`{items, itemsMore}`)
            .row.fit.items-start.content-start
              chain-item(
                v-for="(i,ii) in items" :key="i.oid"
                :nodeOid="node.oid" :chain="i")
              //- div(v-for="(i,ii) in items" :key="ii").row.full-width.br
              //-   span.text-white {{ i }}
        //- div(
        //-   v-for="n in 100" :key="n"
        //-   :style=`{
        //-     height: 'calc(120%)', borderRadius: '10px',
        //-     paddingLeft: '40px',
        //-   }`
        //-   ).row.full-width.items-start.content-start
        //-   node(v-if="node" ctx="list" :node="node" :needFull="false" :visible="true" :active="false" :mini="false")
        //-   //- chain vote, point
        //-   div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
        //-     //- chain point
        //-     div(
        //-       :style=`{
        //-         position: 'absolute', zIndex: 100, left: '-39px', top: '-8px',
        //-         width: '40px', height: '40px',
        //-       }`
        //-       ).row.items-center.content-center.justify-center
        //-       div(
        //-         :style=`{
        //-           width: '26px', height: '26px',
        //-           borderRadius: '50%', overflow: 'hidden',
        //-         }`
        //-         ).row.bg-grey-2
        //-     //- chain label
        //-     div(:style=`{height: '40px',}`).row.full-width.items-start.content-start
        //-       span.text-white.text-bold Следствие
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import chainCreator from './chain_creator'
import chainItem from './chain_item'

export default {
  name: 'nodeExplorer_nodeChains',
  components: {chainCreator, chainItem},
  props: ['node'],
  data () {
    return {
      tab: 'sphere',
      chain: null,
      chainExplorerOpened: false,
      chainExplorerOpenedFinally: false,
      chainFinderOpened: false,
    }
  },
  computed: {
    sphereOid () {
      return this.node.sphereFromName.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_CHAINS,
          oidSphere: this.sphereOid,
          // OBJECT_TYPE_ENUM: 'SPHERE'
        }
      }
    }
  },
  watch: {
  },
  methods: {
    chainClick (chain) {
      this.$log('chainClick', chain)
      this.chain = chain
      this.chainExplorerOpened = true
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
