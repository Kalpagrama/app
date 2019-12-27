<template lang="pug">
.row.full-width.items-start.content-start.q-pa-md
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutAction")
  div(
    v-for="(c, ci) in cuts" :key="c.type"
    :style=`{position: 'relative', minHeight: '40px', overflow: 'hidden', borderRadius: '10px'}`
    ).row.full-width.q-mb-sm.bg-grey-4
    div(
      v-if="ci == cutIndex"
      :style=`{position: 'relative', height: '46px'}`
      ).row.full-width.items-center.content-center.q-px-sm.bg-grey-4
      //- :color="cutPlaying === ci ? 'red' : 'green'"
      q-btn(
        round dense push @click="cutPlay(c, ci)"
        :style=`{background: c.color}`)
        q-icon(:name="cutPlaying === ci ? 'pause' : 'play_arrow'" color="white")
      .col
      //- modes of cut: loop, slow, fast, shit
      //- q-btn( round flat icon="refresh" color="grey" @click="cutPlay(c, ci)")
      //- q-btn( round flat icon="refresh" color="grey" @click="cutPlay(c, ci)")
      //- q-btn( round flat icon="refresh" color="grey" @click="cutPlay(c, ci)")
      .col
      //- actions
      q-btn(round flat dense icon="more_vert" color="grey-8" @click="$refs.cutDialog.show()")
    //- cut body: name, start, end.
    div(
      :style=`{position: 'relative', height: '40px'}`
      ).row.full-width.items-center.content-center.justify-end
      //- cut.name if we had one
      div(@click="cutName = c.name, cutNameEditing = ci").col.full-height
        .row.fit.items-center.content-center.q-px-sm
          span(
            v-if="cutNameEditing !== ci && c.name && c.name.length > 0"
            ) {{ c.name }}
          input(
            v-if="cutNameEditing === ci"
            v-model="c.name"
            @keyup.enter="cutNameEditing = -1"
            :style=`{background: 'none', margin: 0, padding: 0}`).full-width.kinput
      //- start
      div(
        @click="cutSetStart(c, ci)"
        :style=`{}`
        ).full-height.cursor-pointer
        .row.fit.items-center.content-center
          .col
            .row.fit.items-center.justify-center.q-px-sm
              span(
                :class=`{'text-green': cutStart == ci, 'text-bold': cutStart === ci}`
                :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(c.points[0].x*100))/100) }}
      //- divider of start&end
      div().row.full-height.items-center.justify-center
        span(:style=`{fontSize: '16px'}`).text-black.text-bold.q-mx-xs -
      //- end
      div(
        @click="cutSetEnd(c, ci)"
        :style=`{}`
        ).full-height.cursor-pointer
        div(:style=`{paddingRight: '0px'}`).row.fit.items-center.content-center
          .col
            .row.fit.items-center.justify-center.q-px-sm
              span(
                :class=`{'text-green': cutEnd == ci, 'text-bold': cutEnd === ci}`
                :style=`{fontSize: '16px', userSelect: 'none'}`).text-black {{ $time((parseInt(c.points[1].x*100))/100) }}
    //- cut set start&end
    nc-fve-cut-set-time(
      v-if="cutSetShow(c, ci)"
      :player="player" :now="now" :cut="c" :index="ci" :pointIndex="cutStart == ci ? 0 : 1")
    //- cut INACTIVE tint
    div(
      v-if="cutIndex !== ci" @click="cutClick(c, ci)"
      :style=`{position: 'absolute', zIndex: 200, background: 'rgba(0,0,0,0.2)'}`).row.fit.cursor-pointer
    //- cut PLAYING tint
    div(
      v-if="cut && cutPlaying === ci"
      :style=`{
        position: 'absolute', zIndex: 100, right: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
        width: ((cut.points[1].x-now)/(cut.points[1].x-cut.points[0].x))*100+'%'}`
      ).row.full-height
</template>

<script>
import ncFveCutSetTime from './nc_fve_cut_set_time'

export default {
  name: 'ncFveCuts',
  components: {ncFveCutSetTime},
  props: ['cuts', 'cutIndex', 'now', 'player'],
  data () {
    return {
      cutStart: -1,
      cutEnd: -1,
      cutName: '',
      cutNameEditing: -1
    }
  },
  computed: {
    cutDialogOptions () {
      let options = {
        header: this.cut ? this.cut.name.length > 0 : false,
        headerName: this.cut ? this.cut.name : '',
        confirm: true,
        confirmName: 'Export to forge',
        actions: {
          down: {name: 'Down'},
          up: {name: 'Up'},
          delete: {name: 'Delete', color: 'red'},
        }
      }
      if (this.cutIndex === 0) delete options.actions.up
      if (this.cutIndex === this.cuts.length - 1) delete options.actions.down
      return options
    }
  },
  watch: {
    cutIndex: {
      handler (to, from) {
        this.cutStart = -1
        this.cutEnd = -1
        this.cutNameEditing = -1
        this.cutName = ''
      }
    }
  },
  methods: {
    cutPlay (c, ci) {
      this.$log('cutPlay')
      this.$emit('cutPlay', ci)
    },
    cutSetShow (c, ci) {
      if (this.cutIndex === ci) {
        if (this.cutStart === ci || this.cutEnd === ci) return true
        else return false
      } else {
        return false
      }
    },
    cutSetStart (c, ci) {
      this.$log('cutSetStart')
      this.cutEnd = -1
      if (this.cutStart === ci) {
        this.cutStart = -1
      } else {
        this.cutStart = ci
      }
    },
    cutSetEnd (c, ci) {
      this.$log('cutSetEnd')
      this.cutStart = -1
      if (this.cutEnd === ci) {
        this.cutEnd = -1
      } else {
        this.cutEnd = ci
      }
    },
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      this.$emit('cutIndex', ci)
    },
    cutUp (index) {
      this.$log('cutUp')
      let current = this.cuts[index]
      let to = this.cuts[index - 1]
      this.cuts[index] = to
      this.cuts[index - 1] = current
      this.$nextTick(() => {
        this.cutIndex = index - 1
      })
    },
    cutDown (index) {
      this.$log('cutDown')
      let current = this.cuts[index]
      let to = this.cuts[index + 1]
      this.cuts[index] = to
      this.cuts[index + 1] = current
      this.$nextTick(() => {
        this.cutIndex = index + 1
      })
    },
    cutDelete (index) {
      this.$log('cutDelete', index)
      this.cutIndex = -1
      this.$delete(this.fragment.cuts, index)
    },
    cutExport () {
      this.$log('cutExport', this.cut)
      // create node with one fragment...
    },
    cutAction (action) {
      this.$log('cutAction', action)
      switch (action) {
        case 'confirm': {
          this.$log('EXPORT')
          break
        }
        case 'up': {
          this.cutUp(this.cutIndex)
          break
        }
        case 'down': {
          this.cutDown(this.cutIndex)
          break
        }
        case 'delete': {
          if (confirm(this.$t('Delete cut?'))) this.cutDelete(this.cutIndex)
          break
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
