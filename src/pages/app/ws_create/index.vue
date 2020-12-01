<template lang="pug">
div(
  :style=`{
    paddingBottom: '100vh'
  }`
  ).row.full-width.justify-center
  //- header
  .row.full-width.justify-center.q-py-sm
    div(
      :style=`{
        maxWidth: 600+'px',
        height: '60px',
        borderRadius: '10px',
      }`).row.full-width.b-40.q-pa-sm
      .col
        .row.full-width.text-white w/h {{rowsWidth}}/{{rowsHeight}}
        .row.full-width.text-white hP {{rowsHeightPercents}}
      q-btn(
        @click="editing = !editing"
        round flat
        :icon="editing ? 'check' : 'edit'"
        :color="editing ? 'green' : 'white'")
  //- editor wrapper
  .row.full-width.justify-center
    div(:style=`{maxWidth: 600+'px'}`).row.full-width
      //- rows wrapper
      div(
        :style=`{
          position: 'relative',
          //- overflow: editing ? 'auto' : 'hidden',
        }`
        ).row.full-width.items-start.content-start
        q-resize-observer(@resize="rowsOnResize")
        //- hints
        hint(
          v-for="(hint,hinti) in hints" :key="hint.id"
          v-touch-pan.prevent.mouse="$event => hintOnPan(hint, $event)"
          :hint="hint"
          :editing="editing"
          :rowsWidth="rowsWidth"
          :rowsHeight="rowsHeight"
          :zIndex="2000+hinti"
          :options="options"
          :style=`{
            position: 'absolute', zIndex: 2000+hinti,
            top: hint.y+'%',
            left: hint.x+'%',
            //- whiteSpace: 'nowrap',
          }`)
        //- rows
        div(
          v-for="(row,rowi) in rows" :key="row.id"
          :style=`{
            position: 'relative',
            paddingBottom: row.h+'%',
            border: borderOn ? '10px solid black' : 'none',
            boxSizing: 'border-box',
          }`
          ).row.full-width
          //- row columns wrapper
          div(
            :style=`{
              position: 'absolute', zIndex: 100,
            }`
            ).row.fit
            //- row columns
            div(
              v-for="(col,coli) in row.columns" :key="col.id"
              :style=`{
                maxWidth: col.w ? col.w+'%' : 'none',
                background: col.bg || 'black',
                border: borderOn ? '10px solid black' : 'none',
                boxSizing: 'border-box',
              }`
              ).col.full-height
              cell(
                :editing="editing"
                :rowsHeight="rowsHeight"
                :rowsWidth="rowsWidth"
                :row="row"
                :rowi="rowi"
                :cell="col"
                :cellIsFirst="coli === 0"
                :cellIsLast="coli === row.columns.length-1"
                :kWidth="kWidth"
                :kHeight="kHeight"
                @delete="columnDelete(row, rowi, col, coli)"
                @d="$event => columnOnResize(row, coli, $event)")
          //- row DRAG
          //- q-btn(
            v-if="editing"
            round flat dense color="white" icon="drag_indicator"
            :style=`{
              position: 'absolute', zIndex: 210, left: '-36px', top: '0px',
            }`)
          //- row MOVE up/down
          div(
            v-if="editing && rows.length > 1"
            :style=`{
              position: 'absolute', zIndex: 210, left: '-36px', top: '0px',
              width: '36px',
            }`
            ).row.full-height.items-center.content-center.justify-center
            q-btn(
              @click="rowMove(row, rowi, 0)"
              round flat dense color="white" icon="keyboard_arrow_up").full-width
            q-btn(
              @click="rowMove(row, rowi, 1)"
              round flat dense color="white" icon="keyboard_arrow_down").full-width
          //- row RESIZE btn
          div(
            v-if="editing"
            v-touch-pan.vertical.mouse="$event => rowOnPan(row, $event)"
            :style=`{
              position: 'absolute', zIndex: 210, bottom: '-10px',
              right: 'calc(50% - 50px)',
              height: '20px', width: '100px',
              borderRadius: '10px',
              cursor: 'grabbing',
            }`
            ).row.justify-center.bg-green
            q-icon(name="drag_indicator" color="white" size="20px").rotate-90
          //- row RESIZE line
          div(
            v-if="editing"
            :style=`{
              position: 'absolute', zIndex: 209, bottom: '-1px',
              height: '2px',
              pointerEvents: 'none',
            }`
            ).row.full-width.bg-green
          //- column ADD
          q-btn(
            v-if="editing"
            @click="columnAdd(row,rowi)"
            flat color="green" icon="add"
            :style=`{
              position: 'absolute', zIndex: 200, right: '-40px',
              width: '40px',
            }`
            ).full-height
      //- row ADD
      div(
        v-if="editing"
        ).row.full-width.q-py-sm
        q-btn(
          @click="rowAdd"
          flat color="green" icon="add"
          ).full-width
  //- h1 create
//- .row.full-width.justify-center
  kalpa-finder(
    @contentKalpa="contentKalpaFound"
    :pages=`{
      workspace: {views: ['all', 'nodes', 'drafts', 'image', 'video']},
      kalpagrama: {views: ['all', 'users', 'nodes']},
      gif: {views: ['all']},
      web: {views: ['all', 'image', 'video',]}
    }`
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
      height: $q.screen.height+'px',
    }`).b-30
    template(v-slot:header)
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col
          span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать контент
    template(v-slot:tint=`{item}`)
      div(
        @click="itemFound(item)"
        :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
</template>

<script>
export default {
  name: 'wsCreate',
  components: {
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
    cell: () => import('./cell.vue'),
    hint: () => import('./hint.vue'),
  },
  data () {
    return {
      rowsWidth: 0,
      rowsHeight: 0,
      rows: [
        {
          id: 'r1',
          h: 50,
          columns: [
            {id: 'r1c1', w: 100, bg: 'black'},
          ]
        },
      ],
      hints: [
        {
          id: 'h1',
          name: 'her',
          nameSize: 14,
          x: 10,
          y: 10,
          background: 'black',
        }
      ],
      editing: true,
      options: {
      },
      borderOn: true,
      borderColor: 'black',
    }
  },
  computed: {
    rowsHeightPercents () {
      return this.rows.reduce((acc, val) => {
        acc += val.h
        return acc
      }, 0)
    },
    kWidth () {
      return 100 / this.rowsWidth
    },
    kHeight () {
      return 100 / this.rowsHeight
    }
  },
  watch: {
    // rows: {
    //   deep: true,
    //   immediate: true,
    //   handler (to, from) {
    //     if (to) {
    //       localStorage.setItem('wsCreate_rows', JSON.stringify(to))
    //     }
    //     else {
    //       let rows = localStorage.getItem('wsCreate_rows')
    //       this.rows = rows || this.rowsInit
    //     }
    //   }
    // }
  },
  methods: {
    hintOnPan (hint, e) {
      // this.$log('hintOnPan', e.delta.y)
      // y
      // let hPX = (hint.y / this.rowsHeightPercents) * this.rowsHeight
      // let hPXd = e.delta.y
      // let h = hPX + hPXd
      // let y = (h / this.rowsHeight) * this.rowsHeightPercents
      let y = e.delta.y * this.kHeight
      hint.y += y
      // x
      let wPX = (hint.x / 100) * this.rowsWidth
      let wPXd = e.delta.x
      let w = wPX + wPXd
      let x = (w / this.rowsWidth) * 100
      hint.x = x
    },
    rowMove (row, rowi, down) {
      this.$log('rowMove', down)
      let iTo = down ? rowi + 1 : rowi - 1
      let rowTo = this.rows[iTo]
      if (rowTo) {
        this.$set(this.rows, iTo, row)
        this.$set(this.rows, rowi, rowTo)
      }
    },
    columnDelete (row, rowi, col, coli) {
      this.$log('columnDelete', coli)
      // deleting last column in a row, check for the last row!
      if (row.columns.length === 1) {
        if (this.rows.length === 1) {
          this.$q.notify({type: 'negative', color: 'red', message: 'Cant delete last row!'})
        }
        else {
          // delete row...
          this.$delete(this.rows, rowi)
        }
      }
      else {
        // share with W
        let columnLeft = row.columns[coli - 1]
        let columnRight = row.columns[coli + 1]
        let columnSharing = columnLeft || columnRight
        columnSharing.w += col.w
        // delete column
        this.$delete(row.columns, coli)
      }
    },
    columnOnResize (row, coli, d) {
      // this.$log('cellOnResize', d)
      let columnRight = row.columns[coli + 1]
      if (columnRight) {
        columnRight.w += d
      }
    },
    rowsOnResize (e) {
      this.rowsWidth = e.width
      this.rowsHeight = e.height
    },
    rowOnPan (row, e) {
      // this.$log('rowOnPan', e.delta.y)
      // let hTotal = this.rows.reduce((acc, val) => {
      //   acc += val.h
      //   return acc
      // }, 0)
      let hPX = (row.h / this.rowsHeightPercents) * this.rowsHeight
      let dPX = e.delta.y
      let h = hPX + dPX
      let x = (h / this.rowsHeight) * this.rowsHeightPercents
      if (x > 100) return
      row.h = x
    },
    rowAdd () {
      this.$log('rowAdd')
      let rowInput = {
        id: Date.now().toString(),
        h: 50,
        columns: [
          {id: Date.now().toString(), w: 100, bg: null}
        ]
      }
      this.rows.push(rowInput)
    },
    columnAdd (row, rowi) {
      this.$log('columnAdd', row, rowi)
      // check
      if (row.columns.length > 3) return
      // work
      let columnLast = row.columns[row.columns.length - 1]
      let d = columnLast.w / 2
      columnLast.w -= d
      let columnId = Date.now().toString()
      let columnColor = this.$randomColor(columnId)
      let columnInput = {
        id: columnId,
        w: d,
        bg: columnColor,
        name: columnId,
      }
      row.columns.push(columnInput)
    },
    itemFound (item) {
      this.$log('itemFound', item)
      this.contentKalpaFound(item)
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      this.$router.replace('/content/' + contentKalpa.oid)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
  }
}
</script>
