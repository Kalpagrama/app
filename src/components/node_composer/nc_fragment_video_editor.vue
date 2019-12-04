<template lang="pug">
div(:style=`{overflow: 'hidden'}`).column.full-width.bg-black
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutDialogAction")
  div(
    v-if="content.contentSource === 'KALPA'"
    :style=`{height: '100px'}`).row.full-width.items-center.scroll
    .row.no-wrap
      div(:style=`{height: '40px', width: width/2+'px', minWidth: width/2+'px'}`).row
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
        img(
          v-for="(f,fi) in frames" :key="fi"
          :src="f"
          :style=`{height: '40px'}`)
      div(:style=`{height: '40px', width: width/2+'px', minWidth: width/2+'px'}`).row
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-sm.q-px-md
      div(v-for="(c, ci) in cuts" :key="ci"
        :style=`{height: '54px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.q-mb-sm.bg-grey-10.q-px-sm
        div(:style=`{height: '40px', width: '40px', borderRadius: '10px', background: $randomColor(ci)}`)
        .col.full-height
          .row.fit.items-center.content-center.q-px-sm
            span.text-white Cut {{ i }}
            .row.full-width
              small.text-white {{(parseInt(c.start*100))/100}}-
              small.text-white {{(parseInt(c.end*100))/100}}
        q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
      //- div(:style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.justify-center.bg-grey-10
      q-btn(outline color="green" size="md" icon="add" @click="cutCreate()"
        :style=`{height: '50px', borderRadius: '10px'}`).full-width
  div(:style=`{height: '75px'}`).row.full-width.items-start.q-px-md
    q-btn(round flat icon="more_vert" color="white")
</template>

<script>
export default {
  name: 'ncFragmentVideoEditor',
  props: ['width', 'content', 'player'],
  data () {
    return {
      cutIndex: -1,
      cuts: []
    }
  },
  computed: {
    frames () {
      return this.content.frameUrls.filter((f, fi) => {
        return fi % 2 === 0
      })
    },
    framesCount () {
      return this.content.frameUrls.length
    },
    frameDuration () {
      return this.content.duration / this.framesCount
    },
    cutDialogOptions () {
      return {
        header: false,
        headerName: '',
        actions: {
          up: {name: 'Up'},
          down: {name: 'Down'},
          delete: {name: 'Delete', color: 'red'}
        }
      }
    }
  },
  methods: {
    cutDialogAction (action) {
      this.$log('cutDialogAction', action)
      switch (action) {
        case 'up': {
          this.cutUp(this.cutIndex)
          break
        }
        case 'down': {
          this.cutDown(this.cutIndex)
          break
        }
        case 'delete': {
          this.cutDelete(this.cutIndex)
          break
        }
      }
      this.cutIndex = -1
    },
    cutMoreClick (c, ci) {
      this.$log('cutMoreClick', c, ci)
      this.cutIndex = ci
      this.$refs.cutDialog.show()
    },
    cutCreate () {
      this.$log('cutCreate', this.player.currentTime)
      this.cuts.push({
        type: 'default',
        name: '',
        thumbUrl: '',
        start: this.player.currentTime,
        end: this.player.currentTime + 3
      })
    },
    cutUp () {
      this.$log('pointUp')
    },
    cutDown () {
      this.$log('pointDown')
    },
    cutDelete (index) {
      this.$log('pointDelete')
      this.cuts = this.cuts.filter((c, ci) => ci !== index)
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
