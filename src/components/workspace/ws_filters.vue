<template lang="pug">
.column.fit
  div(:style=`{position: 'relative', height: height+'px', overflow: 'hidden'}`
    ).row.full-width.items-center.content-center.bg-white
    //- slot(name="items" :items="itemsFitlered")
    .row.full-width.q-px-sm
      div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(v-model="search" filled placeholder="Поиск").full-width
  div(ignore-body-scroll-lock).col.scroll.full-width
    slot(name="items" :items="itemsFiltered")
</template>

<script>
export default {
  name: 'wsFilters',
  props: ['items'],
  data () {
    return {
      opened: false,
      height: 0,
      search: ''
    }
  },
  computed: {
    itemsFiltered () {
      // return []
      return this.items
    }
  },
  methods: {
    show () {
      this.$logD('show')
      this.$tween.to(this, 0.2, {
        height: 80,
        onComplete: () => {
          this.opened = true
        }
      })
    },
    hide () {
      this.$logD('hide')
      this.$tween.to(this, 0.2, {
        height: 0,
        onComplete: () => {
          this.opened = false
        }
      })
    },
    toggle () {
      this.$logD('toggle')
      if (this.opened) this.hide()
      else this.show()
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
