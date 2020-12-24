<template lang="pug">
div(
  v-touch-swipe.mouse.up.down="rowsNext"
  :style=`{
    position: 'relative',
    height: height+'px'
  }`
  ).column.full-width.bg-black
  //- current joint bar
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="!rowsNexting"
      :style=`{
        position: 'absolute', zIndex: 2000, top: '50%',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width.q-px-md
        div(
          @click.self="jointOpened = !jointOpened"
          :style=`{
            marginTop: jointOpened ? '-80px' : '-30px',
            //- minHeight: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.b-40
          div(
            v-if="jointOpened"
            :style=`{height: '50px',}`).row.full-width
          div(
            :style=`{
              pointerEvents: 'none',
              height: '60px',
            }`
            ).row.full-width.items-center.content-center
            div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
              span.text-white Причина
            div(:style=`{textAlign: 'center'}`).row.full-width.justify-center
              span.text-white Следствие
          div(
            v-if="jointOpened"
            :style=`{height: '50px',}`).row.full-width
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
      :style=`{
        height: rowHeight+'px',
      }`
      @nexting="rowsNexting = $event")
</template>

<script>
import jointsRow from './joints_row.vue'

export default {
  name: 'viewBinary',
  components: {
    jointsRow,
  },
  data () {
    return {
      rowIndex: 0,
      rowsNexting: false,
      rows: [
        {oid: '124314345793390611', type: 'top'},
        {oid: '124314345793390611', type: 'bottom'},
        // {oid: '124314345793390611', type: 'bottom'},
        // {oid: '124314345793390611', type: 'bottom'}
      ],
      jointsScrollAreaOverflow: 'hidden',
      jointOpened: false,
    }
  },
  computed: {
    height () {
      return this.$q.screen.height - 60
    },
    rowHeight () {
      return this.height / 2
    }
  },
  methods: {
    rowsNext (e) {
      this.$log('rowsNext start', this.rowIndex)
      let index
      if (e.direction === 'up') {
        this.rows.push({oid: '124314345793390611', type: 'bottom'})
        index = this.rowIndex + 1
      }
      else if (e.direction === 'down') {
        if (this.rowIndex === 0) {
          this.$log('donw RETURN', this.rowIndex)
          return
        }
        index = this.rowIndex - 1
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
          }
        }
      )
    }
  }
}
</script>
