<template lang="pug">
.row.full-width.items-start
  //- page menu fixed or absolute on mobile
  div(
    v-if="true"
    @click="menuClick"
    :style=`{
      position: 'fixed', zIndex: 1000, left: '0px', top: '16px', overflow: 'hidden',
      height: $q.screen.gt.sm ? 'calc(100vh - 32px)' : 'calc(100vh - 32px - 60px)',
      width: $q.screen.gt.sm ? menuWidth+70+'px' : menuWidth+'px',
      paddingLeft: $q.screen.gt.sm ? '70px' : '0px',
      borderRadius: '0 20px 20px 0'}`
    ).column.bg-grey-3
      //- menu header
      div(:style=`{minHeight: '70px', overflow: 'hidden'}`).row.full-width.items-center.q-px-md
        .col
          .row.fit.items-center
            span(v-show="!mini && !menuToggling").text-bold {{ name }}
        q-btn(v-show="!mini && !menuToggling" round flat icon="more_vert" color="grey-6")
      slot(name="header")
      //- menu body
      .col
        div(v-show="!mini && !menuToggling").row.full-width.items-start.q-pl-sm.q-pt-xl
          div(
            v-for="(i, ikey) in items" :key="ikey" @click="itemClick(i, ikey)"
            :style=`{position: 'relative', minHeight: '40px', borderRadius: '20px 0px 0px 20px', background: ikey === item ? '#e0e0e0' : 'none'}`
            ).row.full-width.items-center.q-px-md.q-py-sm.cursor-pointer
            //- top
            div(v-show="ikey === item" :style=`{position: 'absolute', top: '-20px', right: '0px', width: '20px', height: '20px'}`).row.bg-grey-4
              div(:style=`{borderRadius: '0 0 20px 0'}`).row.fit.bg-grey-3
            //- bottom
            div(v-show="ikey === item" :style=`{position: 'absolute', bottom: '-20px', right: '0px', width: '20px', height: '20px'}`).row.bg-grey-4
              div(:style=`{borderRadius: '0 20px 0 0'}`).row.fit.bg-grey-3
            //- name
            span(:class=`{'text-primary': ikey === item, 'text-bold': ikey === item}`) {{ i.name || ikey }}
      //- menu footer
      div(:style=`{height: '60px'}`).row.full-width.items-center.justify-end.q-px-md
        q-btn(v-show="!mini" round flat icon="keyboard_arrow_left" color="grey-6" @click="menuToggle()")
  //- body
  div(:style=`{paddingLeft: $q.screen.gt.sm ? menuWidth+60+16+'px' : '0px'}`).col
    slot(name="body")
</template>

<script>
export default {
  name: 'kPage',
  props: ['name', 'items', 'item'],
  components: {},
  data () {
    return {
      loading: true,
      mini: false,
      menuWidth: 200,
      menuWidthMin: 20,
      menuWidthMax: 200,
      menuToggling: false
    }
  },
  methods: {
    itemClick (i, ikey) {
      this.$log('itemClick', i, ikey)
      this.$emit('item', ikey)
      this.$emit('itemClick', i, ikey)
    },
    menuClick () {
      this.$log('menuClick')
      if (this.mini) this.menuToggle()
    },
    menuToggle () {
      this.$log('menuToggle')
      this.menuToggling = true
      if (this.menuWidth === 200) {
        this.$tween.to(
          this,
          0.25,
          {
            menuWidth: this.$q.screen.gt.sm ? this.menuWidthMin : 0,
            onComplete: () => {
              this.menuToggling = false
              this.mini = true
            }
          }
        )
      } else {
        this.$tween.to(
          this,
          0.25,
          {
            menuWidth: this.menuWidthMax,
            onComplete: () => {
              this.menuToggling = false
              this.mini = false
            }
          }
        )
      }
    }
  },
  created () {
    if (this.$q.screen.gt.sm) {
    } else {
      this.menuToggle()
    }
  },
  mounted () {
    this.$log('mounted')
    this.$root.$on('path', (val) => {
      if (val === this.$route.path) this.menuToggle()
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
