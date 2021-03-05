<template lang="pug">
q-layout(view="hHh Lpr lff")
  div(
    :style=`{
      position: 'fixed', zIndex: 2000, bottom: '0px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        maxWidth: rowItemWidth-2+'px',
        borderRadius: '10px 10px 0 0',
      }`
      ).row.full-width.items-center.content-center.q-px-sm.q-pb-md.b-40.q-pt-sm
      q-btn(
        v-if="!jointCreatorShow"
        @click="$routerKalpa.back()"
        round flat color="grey-6" icon="west"
        :style=`{borderRadius: '50%',}`)
      .col
      //- q-btn(
        v-if="!jointCreatorShow"
        flat no-caps color="white" @click="rowsPrev()") Вверх
      //- q-btn(
        v-if="!jointCreatorShow"
        flat no-caps color="white" @click="rowsNext()")
        span.text-bold Next
      //- .col
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
      .col
      kalpa-menu-popup-global(
        v-if="!jointCreatorShow"
        :showLabel="false")
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
        div(
          :style=`{
            maxWidth: 500+'px',
            //- borderLeft: jointChanging ? 'none' : '1px solid rgb(76,175,80)',
            //- borderTop: jointChanging ? 'none' :  '1px solid rgb(76,175,80)',
            //- borderRight: jointChanging ? 'none' :  '1px solid rgb(76,175,80)',
            //- borderRadius: jointChanging ? 'none' :  '10px 10px 0px 0px',
          }`).row.full-width
          q-resize-observer(@resize="rowItemWidth = $event.width")
          joint-item(
            :key="jointItem.oid"
            :item="jointItem"
            :itemActive="true"
            :itemIndependent="true")
      //- dynamic items
      .row.full-width
        //- v-if="rowActiveKey === rowIndex+row.oid"
        joints-row(
          v-for="(row,rowIndex) in rows" :key="rowIndex+row.oid"
          v-if="rowActiveKey === rowIndex+row.oid"
          v-show="rowActiveKey === rowIndex+row.oid ? true : !jointCreatorShow"
          :ref="`row-${rowIndex+row.oid}`"
          :row="row"
          :rowActive="rowActiveKey === rowIndex+row.oid"
          :rowPaused="jointCreatorShow"
          :rowItemWidth="rowActiveKey === rowIndex+row.oid ? rowItemWidth : rowItemWidth/2"
          :style=`{
            //- transform: rowActiveKey === rowIndex+row.oid ? 'none' : 'scale(0.5)',
          }`
          @next="rowsNext()"
          @joint-change-start="jointChanging = true"
          @joint-change-end="jointChanging = false"
          @joint-visible="(...args) => joinsRowJointVisibleCallback(...args, row, rowIndex)").br
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
      jointChanging: false,
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
          if (to.params.oid !== from.params.oid) {
            this.jointItemPinnedOid = to.params.oid
            // this.$set(this, 'jointItem', null)
            this.jointItem = await this.$rxdb.get(RxCollectionEnum.OBJ, to.params.oid)
            let rowInput = {
              oid: to.params.oid,
              oidsHidden: [],
              jointFrom: to.query.oid,
            }
            // this.rows = []
            // this.$set(this, 'rows', [])
            // this.rows.push(rowInput)
            this.rows.splice(0, 1, rowInput)
            this.rowActiveKey = '0' + to.params.oid
            window.scrollTo(0, 0)
          }
        }
      }
    },
  },
  methods: {
    rowsPrev () {
      this.$log('rowsPrev')
      this.$router.back()
    },
    async rowsNext () {
      this.$log('rowsNext')
      let rowLast = this.rows[this.rows.length - 1]
      this.$log('rowLast', rowLast)
      this.$router.push('/graph/' + rowLast.oid)
    },
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
    // is it always only from active row ? yes!
    async joinsRowJointVisibleCallback (joint, oid, row, rowIndex) {
      this.$log('joinsRowJointVisibleCallback', joint, oid, row, rowIndex)
      if (this.$route.query.oid !== joint.oid) {
        this.$router.replace({query: {oid: joint.oid}})
      }
      // add row for this ?
      let rowInput = {
        oid: oid,
        oidsHidden: [
          joint.oid,
        ],
        jointFrom: null,
      }
      // replace last row
      this.rows.splice(this.rows.length, 1, rowInput)
    },
    onKeydown (e) {
      this.$log('onKeydown', e)
      // up and down
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        if (e.key === 'ArrowDown') this.rowsNext()
        if (e.key === 'ArrowUp') this.$routerKalpa.back()
      }
      // left and right
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        // find active row and go somewhere...
        let rowRef = this.$refs[`row-${this.rowActiveKey}`][0]
        this.$log('rowRef', rowRef)
        if (!rowRef) return
        rowRef.jointMakeVisible(null, true, e.key === 'ArrowRight' ? 'right' : 'left')
      }
      if (e.code === 'Space') {
        e.preventDefault()
        this.rowsNext()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
    // add listeners
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
    // remove listeners
    window.removeEventListener('keydown', this.onKeydown)
  }
}
</script>
