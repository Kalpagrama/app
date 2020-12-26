<template lang="pug">
q-layout(view="hHh Lpr lff").bg-black
  q-footer(
    v-if="!jointCreating"
    reveal).bg-black
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="$router.back()")
          .col
          q-btn(
            @click="jointCreating = !jointCreating"
            color="green"
            :icon="jointCreating ? 'check' : 'add'"
            :style=`{
              borderRadius: '50%',
              width: '40px', height: '40px',
            }`)
          .col
          q-btn(round flat color="white" icon="more_vert")
  q-page-container
    q-page
      div(
        v-touch-swipe.mouse.up.down="rowsNext"
        :style=`{
          position: 'relative',
          height: height+'px'
        }`
        ).column.full-width.bg-black
        //- joint CREATOR
        transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          div(
            v-if="jointCreating"
            :style=`{
              position: 'absolute', zIndex: 1000, top: '50%', height: '50%',
              paddingTop: '33px',
              paddingBottom: '33px',
            }`
            ).row.full-width
            joint-creator(
              :item="null"
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
              :joint="jointCurrent")
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
            :style=`{
              height: rowHeight+'px',
              opacity: rowIndex === ri ? 1 : jointCreating ? 0 : 1
            }`
            @nexting="rowsNexting = $event"
            @item="itemSelected"
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
    }
  },
  computed: {
    height () {
      return this.$q.screen.height - 60
    },
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
      // depeneds on row.oid ? take another...
      // on last row?
    },
    itemSelected (item) {
      this.$log('itemSelected', item)
      this.itemActive = item
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
        0.5,
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
    }
  }
}
</script>
