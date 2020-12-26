<template lang="pug">
q-layout(view="hHh Lpr lff").bg-black
  q-footer(reveal).bg-black
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width
        div(
          v-if="jointCreating"
          :style=`{
            position: 'relative',
            height: rowHeight+'px',
            paddingTop: '35px',
            paddingBottom: '35px',
          }`
          ).row.full-width.bg-black.br
          div(
            :style=`{
              position: 'absolute', zIndex: 3000, top: '-30px', left: '0px',
              height: '60px',
            }`
            ).row.full-width.q-px-md
            div(
              :style=`{
                height: '60px',
                borderRadius: '10px',
              }`
              ).row.full-width.b-40
          q-btn(
            round flat color="green" icon="add" size="xl"
            ).fit.b-30
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="$router.back()")
          .col
          q-btn(
            @click="jointCreating = !jointCreating"
            round flat color="green"
            :icon="jointCreating ? 'check' : 'add'")
  q-page-container
    q-page
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
            :isPinned="rowIndex === ri"
            :isVisible="rowIndex === ri || rowIndex+1 === ri"
            :style=`{
              height: rowHeight+'px',
            }`
            @nexting="rowsNexting = $event")
</template>

<script>
import jointsRow from './joints_row.vue'

export default {
  name: 'viewBinary',
  props: ['item'],
  components: {
    jointsRow,
  },
  created () {
    this.$log('created')
    this.rows = [
      {oid: this.item.oid},
      {oid: this.item.oid}
    ]
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
    },
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
