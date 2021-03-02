<template lang="pug">
q-layout(view="hHh Lpr lff")
  div(
    :style=`{
      position: 'fixed', zIndex: 2000, bottom: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: rowItemWidth+'px',
      }`
      ).row.full-width.q-px-sm.q-pb-md
      .col
      q-btn(
        v-if="!jointCreatorShow"
        @click="jointCreateStart()"
        round color="green" icon="add"
        :style=`{borderRadius: '50%',}`)
      q-btn(
        v-if="jointCreatorShow"
        @click="jointCreateCancel()"
        round color="white" icon="clear" flat
        :style=`{borderRadius: '50%',}`)
  //- joint-creator(
    v-if="jointCreatorShow"
    :item="jointItem"
    :style=`{
      position: 'fixed', zIndex: 1000,
      top: jointCreatorTop+'px',
    }`)
  q-page-container
    q-page(
      v-if="jointItem"
      :style=`{
        paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
        paddingBottom: '600px'
      }`).row.full-width.justify-center
      //- starting item
      .row.full-width.justify-center.q-px-sm
        div(:style=`{maxWidth: 500+'px'}`).row.full-width
          q-resize-observer(@resize="rowItemWidth = $event.width")
          joint-item(
            :item="jointItem"
            :itemActive="true")
      //- dynamic items
      .row.full-width
        joints-row(
          v-for="(row,rowIndex) in rows" :key="rowIndex+row.oid"
          v-if="rowActiveKey === rowIndex+row.oid"
          v-show="rowActiveKey === rowIndex+row.oid ? true : !jointCreatorShow"
          :ref="`row-${rowIndex+row.oid}`"
          :row="row"
          :rowActive="rowActiveKey === rowIndex+row.oid"
          :rowPaused="jointCreatorShow"
          :rowItemWidth="rowItemWidth"
          @joint-visible="(...args) => joinsRowJointVisibleCallback(...args, row, rowIndex)")
          transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            joint-creator(
              v-if="jointCreatorShow && rowActiveKey === rowIndex+row.oid"
              :item="jointItem"
              :maxWidth="rowItemWidth"
              :style=`{
                position: 'absolute', zIndex: 1000, top: '0px',
              }`
              @created="jointCreated")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointsRow from './joints_row/index.vue'
import jointItem from './joints_row/joint_item.vue'
import jointCreator from './joint_creator/index.vue'

export default {
  name: 'pageApp_joint',
  components: {
    jointsRow,
    jointItem,
    jointCreator,
  },
  data () {
    return {
      joint: null,
      jointItem: null,
      jointItemPinnedOid: null,
      rows: [],
      rowActiveKey: null,
      rowItemWidth: 0,
      jointCreatorShow: false,
      jointCreatorTop: 0,
    }
  },
  computed: {
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to && !from) {
          // this.$log('$route TO', to)
          this.jointItemPinnedOid = to.params.oid
          this.jointItem = await this.$rxdb.get(RxCollectionEnum.OBJ, to.params.oid)
          let rowInput = {
            oid: to.params.oid,
            oidsHidden: [],
            jointFrom: to.query.oid,
          }
          this.rows.push(rowInput)
          this.rowActiveKey = '0' + to.params.oid
        }
        // handle another switch
        if (to && from) {
          this.$log('$route TO', to.params.oid, to.query.oid)
        }
      }
    },
  },
  methods: {
    jointCreateStart () {
      this.$log('jointCreateStart')
      // get rowActiveIndex position of top
      // move there ?
      let rowRef = this.$refs[`row-${this.rowActiveKey}`]
      if (rowRef && rowRef[0]) {
        rowRef = rowRef[0].$el
        this.$log('rowRef', rowRef)
        let top = rowRef.getBoundingClientRect().top
        this.jointCreatorTop = top
        this.jointCreatorShow = true
      }
    },
    jointCreateCancel () {
      this.$log('jointCreateCancel')
      this.jointCreatorShow = false
    },
    async jointCreated (joint) {
      this.$log('jointCreated', joint)
      // go to current row and go
      let rowRef = this.$refs[`row-${this.rowActiveKey}`]
      if (rowRef && rowRef[0]) {
        rowRef = rowRef[0]
        this.$log('jointCreated rowRef', rowRef)
        await rowRef.jointsRes.setProperty('currentId', joint.oid)
        await rowRef.jointsRes.gotoCurrent()
      }
      this.jointCreatorShow = false
    },
    async joinsRowJointVisibleCallback (joint, oid, row, rowIndex) {
      // this.$log('joinsRowJointVisibleCallback', joint, oid, row, rowIndex)
      this.$router.push({query: {oid: joint.oid}})
      // add row for this ?
      let rowInput = {
        oid: oid,
        oidsHidden: [
          joint.oid,
        ],
        jointFrom: null,
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
