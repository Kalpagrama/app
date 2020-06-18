<template lang="pug">
.row.fit.justify-center
  div(:style=`{maxWidth: '600px'}`).column.fit
    //- header
    .row.full-width.q-px-sm
      div(v-if="false").row.full-width.q-py-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Explore
    //- body
    .col.full-width.scroll
      //- div(:style=`{paddingTop: '46px', paddingBottom: '200px',}`).row.full-width.items-start.content-start.q-py-md
        //- div(
        //-   v-for="i in 10" :key="i"
        //-   :style=`{height: '300px', borderRadius: '10px', overflow: 'hidden'}`
        //-   ).row.full-width.q-mb-lg.b-60
      kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          list-middle(:items="items" :options=`{paddingTop: 50, paddingBottom: $q.screen.height/3}`)
            template(v-slot:item=`{item, index, indexMiddle}`)
              node(
                ctx="list" layout="PIP"
                :node="item" :index="index" :essence="true"
                :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
                :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
                :active="index === indexMiddle"
                :mini="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'metaSpheres',
  props: ['stateExplorer'],
  data () {
    return {
      sphereOid: null
    }
  },
  computed: {
    // sphereOid () {
    //   return this.stateExplorer.content.oid
    // },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.sphereOid = this.stateExplorer.content.oid
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
