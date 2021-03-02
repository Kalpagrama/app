<template lang="pug">
q-layout(view="hHh Lpr lff")
  //- q-header
  //- tint
  //- div(
    :style=`{
      position: 'fixed', zIndex: 1000, top: '0px', left: '0px',
      background: 'linear-gradient(90deg, rgba(30,30,30,0.5) 0%, rgba(30,30,30,0) 100%)',
      pointerEvents: 'none',
      minHeight: '100vh',
      width: '30%',
    }`
    ).row.br
  //- div(
    :style=`{
      position: 'fixed', zIndex: 1000, top: '0px', right: '0px',
      background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(30,30,30,0.5) 100%)',
      pointerEvents: 'none',
      minHeight: '100vh',
      width: '30%',
    }`
    ).row.br
  q-page-container
    q-page(
      v-if="joint"
      :style=`{
        //- paddingTop: '8px',
        paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
        paddingBottom: '600px'
      }`).row.full-width.justify-center
      //- starting item
      .row.full-width.justify-center.q-px-sm
        div(:style=`{maxWidth: 500+'px'}`).row.full-width
          q-resize-observer(@resize="rowItemWidth = $event.width")
          joint-item(
            :item="joint.items.find(j => j.oid === jointItemPinnedOid)"
            :itemActive="true")
      //- dynamic items
      .row.full-width
        joints-row(
          v-for="(row,rowIndex) in rows" :key="rowIndex+row.oid"
          :row="row"
          :rowActive="rowActiveIndex === rowIndex"
          :rowItemWidth="rowItemWidth"
          @joint-visible="joinsRowJointVisibleCallback")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointsRow from './joints_row/index.vue'
import jointItem from './joints_row/joint_item.vue'

export default {
  name: 'pageApp_joint',
  components: {
    jointsRow,
    jointItem
  },
  data () {
    return {
      joint: null,
      jointItemPinnedOid: null,
      rows: [],
      rowActiveIndex: 0,
      rowItemWidth: 0
    }
  },
  computed: {
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.joint = await this.$rxdb.get(RxCollectionEnum.OBJ, to.params.oid)
          this.jointItemPinnedOid = to.query.oid
          // let itemBottom = this.joint.items.find(j => j.oid !== to.query.oid)
          let rowInput = {
            oid: to.query.oid,
            oidsHidden: []
          }
          this.rows.push(rowInput)
        }
      }
    },
  },
  methods: {
    async joinsRowJointVisibleCallback (joint, oid) {
      this.$log('joinsRowJointVisibleCallback', joint, oid)
      // add row for this ?
      let rowInput = {
        oid: oid,
        oidsHidden: [
          joint.oid,
        ]
      }
      if (this.rows.length > 1) {
        this.$delete(this.rows, this.rows.length - 1)
        await this.$wait(400)
        this.$set(this.rows, this.rows.length, rowInput)
        // this.rows.splice(this.rows.length, 1, rowInput)
        // this.rows.splice(this.rows.length - 1, 1, rowInput)
      }
      else {
        this.$set(this.rows, this.rows.length, rowInput)
        // this.rows.splice(this.rows.length, 1, rowInput)
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
