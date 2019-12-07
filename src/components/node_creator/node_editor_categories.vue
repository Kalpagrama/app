<template lang="pug">
.row.full-width
  //- dialog
  q-dialog(ref="nodeCategoryDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    div(:style=`{position: 'relative'}`).column.fit.bg-white
      //- actions
      q-btn(
        color="primary" no-caps @click="$refs.nodeCategoryDialog.hide()"
        :style=`{position: 'absolute', bottom: '10px', left: '10px', width: 'calc(100% - 20px)', minHeight: '60px', borderRadius: '10px'}`)
        span.text-bold {{$t('Готово')}}
      //- header
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
        span {{$t('Выберите категории (3 максимум)')}}
      //- body
      div(:style=`{paddingBottom: '80px'}`).col.scroll.full-width
        .row.full-width.items-start.content-start
          div(
            v-for="(c, ckey) in categoriesMap" :key="ckey" @click="categoryClick(ckey)"
            :style=`{height: '60px'}`
            :class=`{'bg-grey-4': categories.includes(c.type)}`
            ).row.full-width.items-center.q-px-md
            span(:class=`{'text-black': categories.includes(c.type)}`) {{ $t(c.nameC) }}
  //- header
  div(:style=`{height: '40px'}`).row.full-width.items-end.q-px-sm
    span.text-bold {{$t('Категории')}}
  //- body
  .row.full-width
    div(
      :style=`{minHeight: '56px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-center.q-pa-sm.bg-grey-3
      .col.full-height
        div(@click.self="$refs.nodeCategoryDialog.show()").row.fit.items-center.content-center
          div(
            v-for="(c, ckey) in categoriesMap" :key="ckey" v-if="categories.includes(c.type)"
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
            ).row.bg-accent.q-mr-sm.q-mt-xs
            .col
              .row.fit.items-center.q-px-sm
                span.text-white.q-mb-xs {{ $t(c.nameC)  }}
            q-btn(round flat color="white" icon="clear" @click="categoryDelete(c, ckey)")
          span(v-if="categories.length === 0") {{$t('Выберите категории')}}
      q-icon(name="keyboard_arrow_down" size="30px" color="grey-7" @click="$refs.nodeCategoryDialog.show()").q-mr-sm
</template>

<script>
export default {
  name: 'nodeEditor__categories',
  props: ['value'],
  data () {
    return {
      valued: false,
      categories: []
    }
  },
  watch: {
    value: {
      immediate: true,
      handler (to, from) {
        this.$logD('value CHANGED', to)
        this.categories = to
      }
    }
  },
  computed: {
    categoriesMap () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        val.nameC = `#${val.name.charAt(0).toUpperCase() + val.name.slice(1)}`
        acc[val.type] = val
        return acc
      }, {})
    }
  },
  methods: {
    categoryClick (ckey) {
      this.$logD('categoryClick', ckey)
      // find
      let cFind = this.categories.find(cat => (cat === ckey))
      this.$logD('cFind', cFind)
      if (cFind) {
        this.$logD('DELETE CATEGORY')
        this.categories = this.categories.filter(cat => (cat !== ckey))
      } else {
        this.$logD('ADD CATEGORY')
        if (this.categories.length > 2) return
        this.$set(this.categories, this.categories.length, ckey)
      }
      // emit result
      this.$emit('input', this.categories)
    },
    categoryDelete (c, ckey) {
      this.$logD('categoryDelete', c, ckey)
      this.categories = this.categories.filter(c => (c !== ckey))
      this.$emit('input', this.categories)
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
