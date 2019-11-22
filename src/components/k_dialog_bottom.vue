<template lang="pug">
q-dialog(ref="kDialogBottom" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="$emit('hide')")
  div(
    @click.self="$refs.kDialogBottom.hide()" v-touch-swipe.mouse="swiped"
    :class="getClass")
    div(:style=`{maxWidth: $q.screen.gt.xs ? '330px' : '100%', maxHeight: $q.screen.gt.xs ? 500+'px' : '100%'}`).row.full-width
      slot(v-if="mode === 'custom'" name="default")
      div(v-else-if="mode === 'actions'").row.full-width.q-pa-sm
        //- header
        div(v-if="options.header" :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}` @click="headerClick()").row.full-width.justify-center.items-center.q-mb-md.bg-white
          span.text-bold.text-center {{ $t(options.headerName) }}
        //- actions
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-sm
          div(
            v-for="(a, akey, ai) in options.actions" :key="akey" @click="actionClick(a, akey, ai)"
            :style=`{height: '50px', borderTop: ai > 0 ? '1px solid #eee' : 'none'}`
            ).row.full-width.items-center.justify-center.cursor-pointer
            span(:style=`{color: a.color ? a.color : 'black'}`) {{ $t(a.name) }}
        //- confirm
        q-btn(
          v-if="options.confirm"
          push no-caps color="green" @click="confirmClick()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span.text-bold {{ $t(options.confirmName) }}
</template>

<script>
export default {
  name: 'kDialogBottom',
  props: {
    value: {type: Boolean},
    mode: {
      type: String,
      default () {
        return 'custom'
      }
    },
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
        this.$log('value CHNAGED', to)
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
      this.$log('headerClick')
      this.$emit('action', 'header')
      this.$refs.kDialogBottom.hide()
    },
    actionClick (a, akey, ai) {
      this.$log('actionClick')
      this.$emit('action', akey)
      this.$refs.kDialogBottom.hide()
    },
    confirmClick () {
      this.$emit('action', 'confirm')
      this.$refs.kDialogBottom.hide()
    },
    swiped (e) {
      this.$log('swiped', e)
      if (e.direction === 'down') {
        this.$refs.kDialogBottom.hide()
      }
    },
    show () {
      this.$log('show', this.$refs.kDialogBottom)
      this.$refs.kDialogBottom.show()
    },
    hide () {
      this.$log('hide', this.$refs.kDialogBottom)
      this.$refs.kDialogBottom.hide()
    },
    toggle () {
      this.$log('toggle', this.$refs.kDialogBottom)
      this.$refs.kDialogBottom.toggle()
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
