<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: $q.screen.height-65-8+'px',
  }`
  ).row.full-width.bg-black
  div(
    :style=`{
      position: 'fixed', zIndex: 1000, bottom: '0px',
      //- background: 'none',
      //- paddingBottom: '60px',
      //- height: '65px',
    }`
    ).row.full-width.justify-center
    div(
      :style=`{
        height: '65px',
        maxWidth: $store.state.ui.pageWidth+'px',
        borderRadius: '10px 10px 0 0',
      }`
      ).row.full-width.items-center.content-center.q-px-sm.b-40
      q-btn(round flat color="white" icon="west" @click="$router.back()")
      .col
      q-btn(
        @click="jointCreating = !jointCreating"
        color="green" icon="add"
        :style=`{
          width: '45px', height: '45px',
          borderRadius: '50%',
        }`)
      .col
      q-btn(
        round flat color="white" icon="more_vert")
  q-resize-observer(:debounce="300" @resize="onResize")
  div(
        v-touch-swipe.mouse.up.down="rowsNext"
        :style=`{
          position: 'relative',
          height: height+'px'
        }`
        ).column.full-width.bg-black
        div(
          v-if="true"
          :style=`{
            position: 'absolute',
            zIndex: 500,
            top: 'calc(50% - 60px)',
          }`
          ).row.full-width.justify-center
          div(
            :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
              height: '120px',
              background: 'linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0) 100%)',
            }`
            ).row.full-width
        //- joint CREATOR
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="jointCreating"
            :style=`{
              position: 'absolute', zIndex: 1000, top: '50%', height: '50%',
              //- paddingTop: '30px',
              //- paddingBottom: '30px',
            }`
            ).row.full-width.justify-center
            joint-creator(
              :item="itemPinned"
              :jointCurrent="jointCurrent"
              :style=`{
                maxWidth: $store.state.ui.pageWidth+'px',
              }`
              @published="jointPublished"
              @cancel="jointCreating = false")
        //- joint CURRENT
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="!jointCreating && !rowsNexting"
            :style=`{
              position: 'absolute', zIndex: 2000, top: '50%',
            }`
            ).row.full-width.justify-center
            joint-current(
              v-if="jointCurrent"
              :joint="jointCurrent"
              :itemPinned="itemPinned"
              :style=`{
                maxWidth: '500px',
              }`)
        //- body joints
        div(
          ref="rowsScrollArea"
          :style=`{
            overflow: 'hidden',
          }`
          ).col.full-width
          joints-row(
            v-for="(r,ri) in rows" :key="ri"
            :row="r"
            :rowIndex="ri"
            :isActive="rowIndex === ri || rowIndex+1 === ri"
            :isPinned="rowIndex === ri"
            :isVisible="rowIndex+1 === ri"
            :jointStart="$route.query.joint"
            :style=`{
              height: rowHeight+'px',
              opacity: rowIndex === ri ? 1 : jointCreating ? 0 : 1
            }`
            @nexting="rowsNexting = $event"
            @joint="$event => jointChanged($event, r, ri)")
</template>

<script>
import jointsRow from './joints_row/index.vue'
import jointCreator from './joint_creator/index.vue'
import jointCurrent from './joint_current/index.vue'

export default {
  name: 'viewBinary',
  props: ['item'],
  components: {
    jointsRow,
    jointCreator,
    jointCurrent,
  },
  created () {
    this.$log('created')
    this.rows = [
      {oid: null, item: this.item},
      {oid: this.item.oid, item: null}
    ]
  },
  mounted () {
    this.$log('mounted')
    window.addEventListener('keydown', this.onKeydown)
    document.body.style.background = 'black'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    window.removeEventListener('keydown', this.onKeydown)
  },
  data () {
    return {
      rowIndex: 0,
      rowsNexting: false,
      rows: [
        // {oid: '124314345793390611', type: 'top'},
        // {oid: '124314345793390611', type: 'bottom'},
        // {oid: '124314345793390611', type: 'bottom'},
        // {oid: '124314345793390611', type: 'bottom'}
      ],
      // jointsScrollAreaOverflow: 'hidden',
      // jointOpened: false,
      jointCreating: false,
      jointCurrent: null,
      itemActive: null,
      itemPinned: null,
      height: 0,
    }
  },
  computed: {
    // height () {
    //   return this.$q.screen.height - 60
    // },
    rowHeight () {
      return this.height / 2
    },
  },
  methods: {
    onKeydown (e) {
      this.$log('onKeydown', e.key)
      if (e.key === 'ArrowUp') {
        this.rowsNext({direction: 'down'})
      }
      else if (e.key === 'ArrowDown') {
        this.rowsNext({direction: 'up'})
      }
    },
    jointPublished (joint) {
      this.$log('jointPublished', joint)
      // reload what this row or the whole page ?
    },
    jointChanged (joint, r, ri) {
      this.$log('jointChanged', joint, r, ri)
      // save jointCurrent
      this.jointCurrent = joint
      // save itemPinned(top) and itemActive(bottom)
      this.itemPinned = joint.items.find(i => i.oid === r.oid)
      this.itemActive = joint.items.find(i => i.oid !== r.oid)
    },
    rowsNext (e) {
      this.$log('rowsNext start', this.rowIndex)
      if (this.rowsNexting) return
      if (this.jointCreating) return
      let index
      // before
      // up
      if (e.direction === 'up') {
        this.$log('rowsNext up')
        index = this.rowIndex + 1
        if (!this.rows[index]) {
          this.$log('rowsNext up !this.rows[index]')
          return
        }
        this.rows.push({oid: this.itemActive.oid, item: null})
      }
      // down
      else if (e.direction === 'down') {
        this.$log('rowsNext down')
        if (this.rowIndex === 0) {
          this.$log('rowsNext down RETURN', this.rowIndex)
          return
        }
        index = this.rowIndex - 1
        if (!this.rows[index]) {
          this.$log('rowsNext down !this.rows[index]')
          return
        }
        // this.rows.pop()
      }
      let scrollTop = index * this.rowHeight
      this.rowsNexting = true
      this.$tween.to(
        this.$refs.rowsScrollArea,
        0.3,
        {
          scrollTop: scrollTop,
          onComplete: () => {
            this.$log('rowsNext done')
            this.rowIndex = index
            this.rowsNexting = false
            // after hook
            if (e.direction === 'up') {
            }
            else if (e.direction === 'down') {
              this.rows.pop()
            }
          }
        }
      )
    },
    onResize (e) {
      this.$log('onResize', e)
      if (this.height === 0) this.height = e.height
      // this.height = e.height
      this.width = e.width
    }
  }
}
</script>
