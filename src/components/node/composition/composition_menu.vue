<template lang="pug">
q-btn(
  v-if="active && !mini"
  round flat color="white" icon="more_vert"
  :style=`{
    position: 'absolute', zIndex: 2000,
    top: '8px', right: '8px',
    transform: 'translate3d(0,0,0)',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: $store.state.ui.borderRadius+'px',
  }`)
  kalpa-menu-popup(
    :actions="actions"
    :style=`{
      minWidth: '200px',
    }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'compositionMenu',
  props: ['active', 'mini', 'visible', 'composition', 'content'],
  data () {
    return {
    }
  },
  computed: {
    actions () {
      let res = {
        // name: {
        //   name: this.composition.name,
        //   fn: () => {
        //     this.$log('compositionName click')
        //   }
        // },
        content: {
          name: this.$t('Explore content'),
          fn: () => {
            this.$log('exploreContent')
          }
        },
        save: {
          name: 'Save',
          fn: () => {
            this.$emit('save')
          }
        }
      }
      return res
    }
  }
}
</script>
