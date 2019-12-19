<template lang="pug">
q-dialog(ref="kDialogBottom" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="$emit('hide')")
  div(
    @click.self="$refs.kDialogBottom.hide()" v-touch-swipe.mouse="swiped"
    :class="getClass")
    div(:style=`{maxWidth: $q.screen.gt.xs ? '330px' : '100%', maxHeight: $q.screen.gt.xs ? 500+'px' : '100%'}`).row.full-width.q-px-sm
      //- actions
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-sm
        //- header
        div(v-if="options.header" :style=`{height: '60px', borderBottom: '1px solid #eee'}` @click="headerClick()"
          ).row.full-width.justify-center.items-center.bg-white
          span.text-bold.text-center {{ $t(options.headerName) }}
        div(
          v-for="(a, akey, ai) in options.actions" :key="akey" @click="actionClick(a, akey, ai)"
          :style=`{height: '60px', borderTop: ai > 0 ? '1px solid #eee' : 'none'}`
          ).row.full-width.items-center.justify-center.cursor-pointer
          span(:style=`{color: a.color ? a.color : 'black'}`) {{ $t(a.name) }}
      //- confirm
      q-btn(
        v-if="options.confirm"
        push no-caps color="accent" @click="confirmClick()"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-my-sm
        span.text-bold {{ $t(options.confirmName) }}
</template>

<script>
export default {
  name: 'kDialogBottom',
  props: {
    value: {type: Boolean},
    options: {
      type: Object,
      default () {
        return {
          actions: {},
          header: false,
          headerName: '',
          confirm: false,
          confirmName: ''
        }
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    getClass () {
      if (this.$q.screen.gt.xs) {
        return ['row', 'fit', 'items-center', 'justify-center']
      } else {
        return ['column', 'fit', 'justify-end']
      }
    }
  },
  watch: {
    value: {
      handler (to, from) {
        this.$logD('value CHNAGED', to)
        if (to) {
          this.show()
        } else {
          this.hide()
        }
      }
    }
  },
  methods: {
    headerClick () {
      this.$logD('headerClick')
      this.$emit('action', 'header')
      this.$refs.kDialogBottom.hide()
    },
    actionClick (a, akey, ai) {
      this.$logD('actionClick')
      this.$emit('action', akey)
      this.$refs.kDialogBottom.hide()
    },
    confirmClick () {
      this.$log('confirmClick')
      this.$emit('action', 'confirm')
      this.$refs.kDialogBottom.hide()
    },
    swiped (e) {
      this.$logD('swiped', e)
      if (e.direction === 'down') {
        this.$refs.kDialogBottom.hide()
      }
    },
    show () {
      this.$logD('show')
      this.$refs.kDialogBottom.show()
      this.$emit('show')
    },
    hide () {
      this.$logD('hide', this.$refs.kDialogBottom)
      this.$refs.kDialogBottom.hide()
      this.$emit('hide')
    },
    toggle () {
      this.$logD('toggle', this.$refs.kDialogBottom)
      this.$refs.kDialogBottom.toggle()
    }
  },
  mounted () {
    // this.$logD('mounted')
  },
  beforeDestroy () {
    // this.$logD('beforeDestroy')
  }
}
</script>
