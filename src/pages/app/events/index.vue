<template lang="pug">
q-layout(container :style=`{height: $q.screen.height+'px', width: $q.screen.width+'px'}`).column.bg-grey-2
  q-header(reveal)
    div(:style=`{height: '60px'}`).row.full-width.bg-white
      .col.full-height
        .row.fit.items-center.q-px-md
          span.text-bold.text-black Events
  q-page-container.fit
    q-page.col.bg-grey-2
      .row.full-width.items-start.content-start.q-pa-md
        div(
          v-for="(e, ei) in events" :key="ei"
          :style=`{borderRadius: '10px', overflow: 'hidden'}`
          ).row.full-width.bg-white.q-pa-sm.q-mb-sm
          div(:style=`{height: '60px', width: '60px', borderRadius: '10px', overflow: 'hidden'}`).row.items-center.justify-center.bg-black
            img(:src="e.object.thumbUrl"
              :style=`{height: '50px'}`)
          .col.full-height
            .row.fit.items-center.q-px-sm
              span {{ e.type }}
          div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
            img(:src="e.subject.thumbUrl"
              :style=`{height: '40px', borderRadius: '50%', overflow: 'hidden'}`)
  q-footer(reveal).lt-sm
    k-menu-horiz
</template>

<script>
export default {
  name: 'pageApp__notifications',
  props: ['width', 'height'],
  data () {
    return {
    }
  },
  computed: {
    events () {
      return this.$store.state.events.userEvents
    },
    eventsCount () {
      return this.events.length
    }
  },
  methods: {
    editToggle () {
      this.$log('editToggle')
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

<style lang="stylus">
.q-footer {
  background: none !important
}
</style>
