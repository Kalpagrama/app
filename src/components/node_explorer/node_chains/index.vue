<template lang="pug">
//- div(:style=`{position: 'relative'}`).column.fit
//-   //- left line, like metropolitan
//-   div(:style=`{position: 'absolute', zIndex: 100, left: '10px',}`).column.full-height.q-px-sm.q-pt-md
//-     div(:style=`{position: 'relative', width: '6px', borderRadius: '3px',}`).row.full-height.bg-grey-4
//-   chain-creator(:node="node")
//-   //- chain top
//-   div(:style=`{position: 'relative', zIndex: 100, paddingLeft: '40px', paddingTop: '0px',}`).row.full-width
//-     //- chain point
//-     div(
//-       :style=`{
//-         position: 'absolute', zIndex: 100, left: '1px', top: '0px',
//-         width: '40px', height: '40px',
//-       }`
//-       ).row.items-center.content-center.justify-center
//-       div(
//-         :style=`{
//-           width: '26px', height: '26px',
//-           borderRadius: '50%', overflow: 'hidden',
//-         }`
//-         ).row.bg-grey-2
//-     //- chain top label
//-     div(:style=`{height: '30px',}`).row.full-width.items-end.content-end
//-       span.text-white.text-bold Причина
//-     //- chain top node wrapper
//-     node(v-if="node" ctx="list" :node="node" :needFull="false" :visible="true" :active="false" :mini="false")
//-   //- chains of the bottom
//-   div.col.full-width
//-     .column.fit
//-       .col.full-width.scroll.q-pt-sm
//-         kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
//-           template(v-slot=`{items, itemsMore}`)
//-             .row.fit.items-start.content-start
//-               chain-item(
//-                 v-for="(i,ii) in items" :key="i.oid"
//-                 :nodeOid="node.oid" :chain="i")
//-               //- div(v-for="(i,ii) in items" :key="ii").row.full-width.br
//-               //-   span.text-white {{ i }}
//-         //- div(
//-         //-   v-for="n in 100" :key="n"
//-         //-   :style=`{
//-         //-     height: 'calc(120%)', borderRadius: '10px',
//-         //-     paddingLeft: '40px',
//-         //-   }`
//-         //-   ).row.full-width.items-start.content-start
//-         //-   node(v-if="node" ctx="list" :node="node" :needFull="false" :visible="true" :active="false" :mini="false")
//-         //-   //- chain vote, point
//-         //-   div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
//-         //-     //- chain point
//-         //-     div(
//-         //-       :style=`{
//-         //-         position: 'absolute', zIndex: 100, left: '-39px', top: '-8px',
//-         //-         width: '40px', height: '40px',
//-         //-       }`
//-         //-       ).row.items-center.content-center.justify-center
//-         //-       div(
//-         //-         :style=`{
//-         //-           width: '26px', height: '26px',
//-         //-           borderRadius: '50%', overflow: 'hidden',
//-         //-         }`
//-         //-         ).row.bg-grey-2
//-         //-     //- chain label
//-         //-     div(:style=`{height: '40px',}`).row.full-width.items-start.content-start
//-         //-       span.text-white.text-bold Следствие
//- *** new
div(
  :style=`{position: 'relative'}`).column.fit
  //- abs frame
  div(
    v-if="false"
    :style=`{
    position: 'absolute', zIndex: 2000, paddingLeft: '14px', paddingRight: '10px', paddingBottom: '60px',
    transformOrigin: 'top center',
    transform: 'rotate(-6deg)', opacity: 0.8}`).row.fit
    div(:style=`{position: 'relative', border: '4px solid white', borderRadius: '12px',}`).row.fit.items-start.content-start.b-50
      //- chain name
      span(:style=`{
        position: 'absolute', zIndex: 1001, left: '10px', bottom: '4px',
        fontSize: '19px'}`).text-white.text-bold Они так похожи
      //- .row.fit.items-start.content-start
      div(:style=`{paddingBottom: '50px',}`).row.fit.items-between.content-between
        div(:style=`{opacity: 0, borderRadius: '10px'}`).row.full-width.items-start.content-start.b-60
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}`).full-width
          div(:style=`{position: 'absolute',bottom: '0px'}`).row.full-width.q-pa-sm
            span.text-white {{ node.name }}
            //- div(:style=`{position: 'absolute',zIndex: 100, left: '-15px', top: '-10px', borderRadius: '50%', width: '24px', height: '24px',}`).row.bg-white
              //- span(:style=`{position: 'absolute', left: '-30px', bottom: '47px', borderRadius: '10px',}`).rotate-270.text-white.text-bold.b-30.q-pa-sm Причина
        div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-60
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}`).full-width
          div(:style=`{position: 'absolute', bottom: '0px'}`).row.full-width.q-pa-sm
            span.text-white Злость
            //- div(:style=`{position: 'absolute',zIndex: 100, left: '-15px', top: '-10px', borderRadius: '50%', width: '24px', height: '24px',}`).row.bg-white
              //- span(:style=`{position: 'absolute', left: '-34px', bottom: '52px', borderRadius: '10px'}`).rotate-270.text-white.text-bold.b-30.q-pa-sm Следствие
  //- nde
  div(:style=`{position: 'absolute', zIndex: 1000, paddingLeft: '14px', paddingRight: '10px',paddingBottom: '90px',}`).row.fit
    div(:style=`{position: 'relative', border: '4px solid white', borderRadius: '12px',}`).row.fit.items-start.content-start.b-50
      //- chain name
      span(:style=`{
        position: 'absolute', zIndex: 1001, left: '10px', bottom: '-34px',
        fontSize: '19px'}`).text-white.text-bold Они так похожи
      //- .row.fit.items-start.content-start
      div(:style=`{paddingBottom: '0px',}`).row.fit.items-between.content-between
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden',}`).row.full-width.items-start.content-start.b-60
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}`).full-width
          div(:style=`{
            position: 'absolute', zIndex: 100, bottom: '0px',
            background: 'rgb(0,0,0)',
            background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)',
            borderRadius: '10px 10px 0 0', overflow: 'hidden',
            transform: 'translate3d(0,0,0)',
            }`).row.full-width.q-pa-sm
            span.text-bold.text-white Злость
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden',}`).row.full-width.items-start.content-start.b-60
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}`).full-width
          div(:style=`{
            position: 'absolute', zIndex: 100, bottom: '0px',
            background: 'rgb(0,0,0)',
            background: 'linear-gradient(0deg, rgba(10,10,10,0.9) 0%, rgba(0,0,0,0) 100%)',
            borderRadius: '10px 10px 0 0', overflow: 'hidden',
            transform: 'translate3d(0,0,0)',
            }`).row.full-width.q-pa-sm
            span.text-bold.text-white Злость
//- div(:style=`{position: 'relative',}`).column.fit.q-pa-sm
  .col.full-width.scroll
    div(:style=`{position: 'relative', paddingBottom: '0px', maxHeight: 'calc(100% - 70px)'}`).row.fit
      div(:style=`{
        position: 'absolute', zIndex: 1000, top: '48%', left: '-6px',
        borderTop: '4px solid white', borderRight: '4px solid white'}`).row.q-pa-sm.b-30.rotate-45
      div(:style=`{
        position: 'absolute', zIndex: 1000, top: '48%', right: '-6px',
        borderBottom: '4px solid white', borderLeft: '4px solid white'}`).row.q-pa-sm.b-30.rotate-45
      div(:style=`{border: '4px solid white', borderRadius: '14px',}`).row.fit.items-between.content-between
        div(:style=`{borderRadius: '10px'}`).row.full-width.b-50
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}` draggable="false").full-width
          .row.full-width.q-pa-sm
            span.text-white {{node.name}}
        div(:style=`{borderRadius: '10px'}`).row.full-width.b-50
          img(:src="node.meta.items[0].thumbUrl" :style=`{borderRadius: '10px',}` draggable="false").full-width
          .row.full-width.q-pa-sm
            span.text-white Злость
    div().row.full-width.items-start.q-px-md.q-mb-xl
      span(:style=`{
        fontSize: '19px'}`).text-white.text-bold Они так похожи
      div(:style=`{height: '400px',}`).row.full-width.q-pa-md.b-60
        span info
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
