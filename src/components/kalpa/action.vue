<template lang="pug">
q-dialog(ref="actionDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down" @hide="dialogClosed()")
  div(@click.self="$refs.actionDialog.hide()").row.fit.items-center.justify-center
    div(
      v-if="options"
      :style=`{width: '300px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.items-start.content-start
      div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.bg-white
        div(
          v-for="(a, akey) in options.actions" :key="akey" @click="action(akey)"
          v-if="akey !== 'confirm'"
          :style=`{height: '55px'}`
          ).row.full-width.items-center.justify-center.cursor-pointer.hr.q-px-sm
          span.text-bold.text-center.text-black {{ a.name }}
      //- confirm
      div(v-if="options && options.actions.confirm").row.full-width.q-mt-sm
        q-btn(
          push no-caps color="green" @click="action('confirm')"
          :style=`{height: '60px', borderRadius: '10px'}`).full-width
          span.text-bold {{ options.actions.confirm.name || $t('Confirm') }}
</template>

<script>
export default {
  name: 'kalpaAction',
  data () {
    return {
      options: null
    }
  },
  watch: {
    '$store.state.ui.actionOpened': {
      handler (to, from) {
        this.$log('actionOpened CHANGED', to)
        if (to) {
          this.options = this.$store.state.ui.actionOptions
          this.$log('options', this.options)
          this.$refs.actionDialog.show()
        } else {
          this.options = null
          this.$refs.actionDialog.hide()
        }
      }
    }
  },
  methods: {
    action (action) {
      this.$log('action', action)
      this.$store.commit('ui/stateSet', ['actionKey', action])
      this.$refs.actionDialog.hide()
    },
    dialogClosed () {
      this.$log('dialogClosed')
      this.$store.commit('ui/stateSet', ['actionOpened', false])
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
