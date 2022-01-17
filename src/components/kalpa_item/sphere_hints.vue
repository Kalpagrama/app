<style lang="sass">
.hint-item
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
.row.full-width
  q-menu(v-model="showTooltip" no-focus auto-close anchor="top middle" :offset="offset" self="bottom middle" dark).transparent.no-shadow
    div(:style=`{height: (maxHeight - 10) + 'px', width: (maxWidth - 20) + 'px'}` :class=`{'q-pa-xs': padding}`).row.content-end.br
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        div(v-if="spheresAutocomplete.length && name && selectedSphereName !== name" :style=`{maxHeight: '100%', maxWidth: '100%',backgroundColor: "rgba(35,35,35,0.8)"}`).row.full-width.scroll-y.br-10.q-pa-sm
          span(v-for="(s,si) in spheresAutocomplete" :key="s.id" @click="selectedSphereName=s.name, $emit('click', s.name)"
            ).hint-item.cursor-pointer.text-grey-1.ellipsis.q-px-sm.q-mr-sm.q-mb-sm.br-5.bs {{s.name}}
</template>

<script>
import debounce from 'lodash/debounce'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereHints',
  props: ['name', 'maxHeight', 'maxWidth', 'offset', 'padding'],
  emits: ['click'],
  data () {
    return {
      showTooltip: true,
      spheresAutocomplete: [],
      selectedSphereName: null
    }
  },
  watch: {
    name: {
      immediate: true,
      async handler (to) {
        this.showTooltip = !!to
        // this.$logT('name changed', to, this.showTooltip)
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
          // this.$logT('this.spheresAutocomplete=' + this.spheresAutocomplete.length)
        }, 300)
      }
      return this.fillSpheresAutoCompleteDebounced(name)
    }
  },
  mounted () {
    // this.$logT('mounted', this.maxHeight)
  },
  unmounted() {
    // this.$logT('unmounted', this.name)
  }
}
</script>
