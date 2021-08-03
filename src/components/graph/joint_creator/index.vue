<template lang="pug">
.row.full-width.items-start.content-start
  div(
    v-if="jointItem"
    :style=`{
      paddingTop: 'calc(env(safe-area-inset-top) + 8px)',
      //- paddingBottom: '600px'
    }`).row.full-width.justify-center
    //- pinned top item
    .row.full-width.justify-center.q-px-sm
      div(
        :style=`{
          maxWidth: 500+'px',
        }`).row.full-width
        q-resize-observer(@resize="rowItemWidth = $event.width")
        joint-item(
          :key="jointItem.oid"
          :item="jointItem"
          :itemActive="!jointCreatorFocused"
          :itemIndependent="true")
          node-feed(
            v-if="jointActive"
            :node="jointActive"
            :showItems="false"
            :showActions="false"
            :showName="false"
            :showAuthorAlways="false")
    //- dynamic items
    .row.full-width.q-mb-xl
      //- v-if="rowActiveKey === rowIndex+row.oid"
      joints-row(
        v-for="(row,rowIndex) in rows" :key="rowIndex+row.oid"
        v-if="rowItemWidth > 0 && rowActiveKey === rowIndex+row.oid"
        v-show="rowActiveKey === rowIndex+row.oid ? true : !jointCreatorShow"
        :ref="`row-${rowIndex+row.oid}`"
        :row="row"
        :rowActive="rowActiveKey === rowIndex+row.oid"
        :rowPaused="jointCreatorShow"
        :rowItemWidth="rowItemWidth"
        :style=`{
          //- transform: rowActiveKey === rowIndex+row.oid ? 'none' : 'scale(0.5)',
        }`
        @next="rowsNext()"
        @empty="jointCreateStart()"
        @joint-change-start="jointChanging = true"
        @joint-change-end="jointChanging = false"
        @joint-visible="(...args) => joinsRowJointVisibleCallback(...args, row, rowIndex)")
        transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          joint-creator(
            v-if="jointCreatorShow && rowActiveKey === rowIndex+row.oid"
            :item="jointItem"
            :maxWidth="rowItemWidth"
            :style=`{
              position: 'absolute', zIndex: 1000, top: '0px',
            }`
            @created="jointCreated"
            @focused="jointCreatorFocused = true"
            @blurred="jointCreatorFocused = false").br
    //- div(:style=`{height: '300px'}`).row.full-width.br
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointsRow from 'src/pages/app/graph/joints_row/index.vue'
import jointItem from 'src/pages/app/graph/joints_row/joint_item.vue'
import jointCreator from 'src/pages/app/graph/joint_creator/index.vue'

export default {
  name: 'grapg_jointCreator',
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
      jointActive: null,
      jointCreatorFocused: false,
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
          this.jointItemPinnedOid = '166220274927142929'
          this.jointItem = await this.$rxdb.get(RxCollectionEnum.OBJ, '166220274927142929')
          let rowInput = {
            oid: '166220274927142929',
            oidsHidden: [],
            jointFrom: '210470061280858163',
          }
          this.rows.push(rowInput)
          this.rowActiveKey = '0' + '166220274927142929'
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
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы создать связь, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
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
      this.jointActive = joint
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
      if (this.$store.state.ui.userTyping) return
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
