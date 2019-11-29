<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.bg
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '500px'}`).row.full-width.q-pt-sm
        //- debug
        div(v-if="false").row.full-width.bg-red.q-mb-md.q-px-sm
          small.full-width opened: {{ opened }}
          small.full-width actionsPaddingTop: {{actionsPaddingTop}}
        //- author
        div(:style=`{height: '60px'}`).row.full-width
          transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            div(
              v-if="opened"
              :style=`{height: '60px'}`).row.full-width.q-px-sm
              div(:style=`{borderRadius: '10px'}`).row.fit.bg-white
                div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
                  div(:style=`{height: '40px', width: '40px', borderRadius: '50%'}`).row.bg-grey-3
                .col.full-height
                  .row.fit.items-center
                    span Ivan Ivanov
        //- node
        div(:style=`{position: 'relative', height: '500px'}`).row.full-width.items-start.content-start.q-pa-sm
          //- f1
          div(:style=`{height: '200px', borderRadius: '10px'}`
            ).row.full-width.items-center.justify-center.bg-black
            span 1
          //- span Node rubick
          div(
            :style=`{position: 'absolute', zIndex: 200, top: 220+'px', left: '0px', height: '60px', }`
            ).row.full-width.q-px-sm
            div(:style=`{borderRadius: '10px'}`).row.fit.items-center.justify-center.bg-white
              span.text-bold How to be happy?
          //- actions
          div(:style=`{position: 'absolute', top: 290+actionsTop+'px', left: '0px', height: '60px'}`
            ).row.full-width.q-px-sm
            div(:style=`{borderRadius: '10px'}`).row.fit.items-center.justify-between.q-px-sm
              div(
                :style=`{
                  height: '45px', minHeight: '45px', maxHeight: '45px',
                  width: '45px', minWidth: '45px', maxWidth: '45px',
                  borderRadius: '50%', overflow: 'hidden',
                  marginLeft: voteLeft+'px'}`
                v-touch-pan.left.right.prevent.mouse="votePan").row.items-center.justify-center.bg-accent
                q-icon(
                  v-if="!voteSending"
                  name="blur_on" color="white" size="35px")
                k-spinner(v-else :width="35" :height="35")
              q-btn(v-if="opened" round icon="more_vert" color="grey-7" flat)
          //- f2
          div(
            :style=`{
              position: 'absolute', zIndex: 150, right: f1.right+'px',
              top: f1.top+'px', width: f1.width+'px', height: f1.height+'px'}`
            ).row.q-pa-sm
            div(:style=`{borderRadius: '10px'}`
              ).row.fit.items-center.justify-center.bg-red
              span 2
</template>

<script>
export default {
  name: 'nodeRubick',
  data () {
    return {
      opened: false,
      f1: {
        top: 105,
        right: 10,
        width: 100,
        height: 100,
        background: '#eee'
      },
      actionsTop: 0,
      voteSending: false,
      votePanning: false,
      voteLeft: 50
    }
  },
  computed: {
    width () {
      return this.$q.screen.width
    }
  },
  methods: {
    vote () {
      return new Promise(async (resolve, reject) => {
        this.$log('vote START')
        this.voteSending = true
        await this.$wait(300)
        this.$log('vote DONE')
        this.voteSending = false
        this.toggle()
      })
    },
    votePan (e) {
      // this.$log('votePan', e)
      let to = this.voteLeft + e.delta.x
      if (to > 50 && to < this.width - 110) this.voteLeft = to
      if (e.isFirst) {
        this.$log('votePan FIRST')
        this.votePanning = true
      }
      if (e.isFinal) {
        this.$log('votePan FINAL')
        this.votePanning = false
        this.vote()
      }
    },
    toggle () {
      if (this.opened) {
        this.close()
      } else {
        this.open()
      }
    },
    open () {
      this.$log('open', this.opened)
      this.opened = true
      this.$tween.to(this.f1, 0.35, {
        top: 276,
        right: 0,
        width: this.width,
        height: 200})
      this.$tween.to(this, 0.35, {actionsTop: 192})
    },
    close () {
      this.$log('close', this.opened)
      this.opened = false
      this.$tween.to(this.f1, 0.35, {
        top: 105,
        right: 10,
        width: 100,
        height: 100})
      this.$tween.to(this, 0.35, {actionsTop: 0})
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
