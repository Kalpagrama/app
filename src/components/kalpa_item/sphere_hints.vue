<style lang="sass">
.hint-item
  color: #424242
  &:hover
    color: #4caf50 !important
</style>

<template lang="pug">
div(ref="menu").row.full-width
  q-menu(v-model="showTooltip" no-focus auto-close anchor="top middle" :offset="offset" self="bottom middle" dark).transparent.no-shadow
    div(:style=`{height: height + 'px', width: maxWidth + 'px'}` :class=`{'q-pa-xs': padding}`).row.content-end
      transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
        div(v-if="spheresAutocomplete.length && name && selectedSphereName !== name" :style=`{maxHeight: '100%', maxWidth: '100%',backgroundColor: "rgba(35,35,35,0.8)"}`).row.full-width.scroll-y.br-10.q-pa-sm
          span(v-for="(s,si) in spheresAutocomplete" :key="s.id" @click="selectedSphereName=s.name, $emit('click', s.name)"
            ).hint-item.cursor-pointer.text-grey-1.ellipsis.q-px-sm.q-mr-sm.q-mb-sm.br-5.bs {{s.name}}
</template>

<script>
import debounce from 'lodash/debounce'
import { RxCollectionEnum } from 'src/system/rxdb'
import { scroll } from 'quasar'
const { getScrollTarget, getVerticalScrollPosition, setVerticalScrollPosition, getScrollHeight } = scroll

export default {
  name: 'sphereHints',
  props: ['name', 'maxHeight', 'maxWidth', 'offset', 'padding'],
  emits: ['click'],
  data () {
    return {
      showTooltip: true,
      spheresAutocomplete: [],
      selectedSphereName: null,
      top: 0,
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
  computed: {
    height() {
      return Math.max(Math.min(this.maxHeight || this.top - 10, this.top - 10), 0)
    }
  },
  methods: {
    updateTop() {
      this.top = this.$getRef('menu') ? this.$getRef('menu').getBoundingClientRect().top : 200
      this.$logT('this.top=', this.top)
    },
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
    this.updateTop()
    this.scrollTarget = getScrollTarget(this.$getRef('menu'))
    this.scrollTarget.addEventListener('scroll', this.updateTop)
    this.scrollTarget.addEventListener('resize', this.updateTop)
  },
  unmounted() {
    this.scrollTarget.removeEventListener('scroll', this.updateTop)
    this.scrollTarget.removeEventListener('resize', this.updateTop)
  }
}
</script>
