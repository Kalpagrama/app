<template lang="pug">
kalpa-layout(
  :style=`{
    minHeight: '100vh',
  }`
  )
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="!$store.state.ui.userTyping")
      template(v-slot:leftButton)
        navMobile
      template(v-if="!jointCreatorShow" v-slot:center)
        .col
        //q-btn(
        //  v-if="!jointCreatorShow"
        //  @click="jointCreateStart()"
        //  round color="green" icon="add"
        //  :style=`{width: '46px', height: '46px', borderRadius: '50%',}`)
        q-btn(
          @click="jointCreateStart()"
          color="green" icon="add" flat no-caps
          :label="$t('Add joint')"
          :style=`{}`)
        .col
      template(v-if="jointCreatorShow" v-slot:all)
        q-btn(
          @click="jointCreateCancel()"
          flat no-caps color="white"
          :style=`{height: '46px',}`) {{$t('Cancel')}}
    //.row.full-width.justify-center
    //  div(
    //    :style=`{
    //      maxWidth: rowItemWidth+16+'px',
    //      borderRadius: '20px 20px 0 0',
    //      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    //    }`
    //    ).row.full-width.items-center.content-center.q-px-sm.b-50.q-pt-sm
    //    q-btn(
    //      v-if="!jointCreatorShow"
    //      @click="$routerKalpa.back()"
    //      flat color="grey-7" icon="west" no-caps
    //      :style=`{
    //        width: '46px', height: '46px',
    //      }`)
    //      small {{$t('Back')}}
    //    .col
    //    q-btn(
    //      v-if="!jointCreatorShow"
    //      @click="jointCreateStart()"
    //      round color="green" icon="add"
    //      :style=`{width: '46px', height: '46px', borderRadius: '50%',}`)
    //    q-btn(
    //      v-if="jointCreatorShow"
    //      @click="jointCreateCancel()"
    //      flat no-caps color="white"
    //      :style=`{height: '46px',}`) {{$t('Cancel')}}
    //    .col
    //    kalpa-menu-popup-global(
    //      v-if="!jointCreatorShow"
    //      color="grey-7"
    //      :style=`{
    //        width: '46px', height: '46px',
    //      }`)
  template(v-slot:body)
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
              item-feed(
                v-if="jointActive"
                :itemShortOrFull="jointActive"
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
                @blurred="jointCreatorFocused = false")
        //- div(:style=`{height: '300px'}`).row.full-width.br
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import jointsRow from './joints_row/index.vue'
import jointItem from './joints_row/joint_item.vue'
import jointCreator from './joint_creator/index.vue'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

export default {
  name: 'pageApp_joint',
  components: {
    jointsRow,
    navMobile,
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
      this.$router.push('/cube/' + rowLast.oid)
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
