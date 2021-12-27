<style lang="sass">
.hint-item
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(v-if="spheresAutocomplete.length && name && selectedSphereName !== name").row.full-width.scroll-y.q-pt-xs
  span(v-for="(s,si) in spheresAutocomplete" :key="s.id" @click="selectedSphereName=s.name, $emit('click', s.name)"
    ).hint-item.cursor-pointer.text-grey-1.ellipsis.q-px-sm.q-mr-sm.q-mb-xs.br-5.b-100 {{s.name}}
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
      immediate: true,
      async handler (to) {
        this.$logT('name changed', to)
        if (to && to !== this.selectedSphereName) this.fillSpheresAutoComplete(to)
      }
    }
  },
  methods: {
    fillSpheresAutoComplete(name) {
      if (!this.fillSpheresAutoCompleteDebounced){
        this.fillSpheresAutoCompleteDebounced = debounce(async (name) => {
          // this.$logT('fillSpheresAutoCompleteDebounced', name)
          let searchRegex = new RegExp(name, 'i');
          let spheresRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
              name: { $regex: searchRegex }
            },
            sort: [{ hitCnt: 'desc' }],
            limit: 100
          })
          this.spheresAutocomplete = spheresRes.items
          this.$logT('this.spheresAutocomplete=' + this.spheresAutocomplete.length)
        }, 300)
      }
      return this.fillSpheresAutoCompleteDebounced(name)
    }
  },
  mounted () {
    this.$logT('mounted', this.name)
  }
}
</script>
