<style lang="sass">
 span
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(v-if="name && selectedSphereName !== name" :style=`{maxHeight: '63px'}`).row.full-width.scroll-y.q-pt-xs
  span(v-for="(s,si) in spheresAutocomplete" :key="s.id" @click="selectedSphereName=s.name, $emit('click', s.name)").text-grey-8.ellipsis.q-px-sm.q-mr-sm.q-mb-xs.bg.br-5 {{s.name}}
</template>

<script>
import debounce from 'lodash/debounce'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereHints',
  props: ['name'],
  emits: ['click'],
  data () {
    return {
      spheresAutocomplete: [],
      selectedSphereName: null
    }
  },
  watch: {
    name: {
      async handler (to) {
        if (to && to !== this.selectedSphereName) this.fillSpheresAutoCompleteDebounced(to)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.fillSpheresAutoCompleteDebounced = debounce(async (name) => {
      let spheresRes = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
          name: { $regex: name }
        },
        sort: [{ hitCnt: 'desc' }],
        limit: 100
      })
      this.spheresAutocomplete = spheresRes.items
    }, 500)
  }
}
</script>
