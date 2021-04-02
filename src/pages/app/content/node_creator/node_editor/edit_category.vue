<template lang="pug">
q-btn(
  flat no-caps color="grey-6" dense icon-right="keyboard_arrow_down"
  :style=`{
    marginTop: '6px', zIndex: 3000,
  }`
  ).q-ml-sm.q-mt-xs.q-mr-sm {{ nodeCategory ? nodeCategory.label : 'Категория' }}
  q-popup-proxy(
    fit cover dark
    max-width="180px"
    anchor="top left"
    position="bottom"
    ).full-width
    div(
      :style=`{
        zIndex: 5000,
        borderRadius: '20px 20px 0 0',
      }`).row.full-width.q-pa-sm.b-40
      //- header
      .row.full-width.q-pa-md
        span(:style=`{fontSize: '24px'}`).text-white.text-bold {{$t('Pick category')}}
        .col
        q-btn(round flat color="white" icon="clear" v-close-popup)
      //- body
      .row.full-width.items-start.content-start
        q-btn(
          v-for="(c,ci) in options" :key="ci"
          v-close-popup
          @click="categoryClick(c.value)"
          flat color="white" no-caps
          align="left"
          ).full-width {{ c.label }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'editCategory',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    options () {
      return this.$store.getters.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    },
    nodeCategory () {
      return this.options.find(i => i.value === this.node.category)
    }
  },
  methods: {
    categoryClick (c) {
      this.$log('categoryClick', c)
      this.$set(this.node, 'category', c)
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
