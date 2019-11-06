<template lang="pug">
q-dialog(ref="kDialogBottom" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
  div(
    @click.self="$refs.kDialogBottom.hide()" v-touch-swipe.mouse="swiped"
    :class="getClass")
    div(:style=`{maxWidth: $q.screen.gt.xs ? '330px' : '100%', maxHeight: $q.screen.gt.xs ? 500+'px' : '100%'}`).row.full-width
      slot(v-if="mode === 'custom'" name="default")
      div(v-else-if="mode === 'actions'").row.full-width.q-pa-sm
        div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.bg-white.q-mb-md
          div(
            v-for="(a, akey, ai) in options.actions" :key="akey" @click="$emit('action', akey), $refs.kDialogBottom.hide()"
            :style=`{height: '50px', borderTop: ai > 0 ? '1px solid #eee' : 'none'}`
            ).row.full-width.items-center.justify-center.cursor-pointer
            span(:style=`{color: a.color ? a.color : 'black'}`) {{ a.name }}
        q-btn(
          v-if="options.confirm"
          push no-caps color="green" @click="$emit('action', 'confirm'), $refs.kDialogBottom.hide()"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span.text-bold {{ options.confirmName }}
</template>

<script>
export default {
  name: 'kDialogBottom',
  props: {
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
  methods: {
    swiped (e) {
      this.$log('swiped', e)
      if (e.direction === 'down') {
        this.$refs.kDialogBottom.hide()
      }
    },
    show () {
      this.$log('show')
      this.$refs.kDialogBottom.show()
    },
    hide () {
      this.$log('hide')
      this.$refs.kDialogBottom.hide()
    },
    toggle () {
      this.$log('toggle')
      this.$refs.kDialogBottom.toggle()
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
