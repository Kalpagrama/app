<template lang="pug">
q-btn(
  flat no-caps color="grey-6" dense icon-right="keyboard_arrow_down"
  :style=`{
    marginTop: '6px', zIndex: 3000,
  }`
  ).q-ml-sm.q-mt-xs.q-mr-sm {{ nodeCategory ? nodeCategory.label : 'Категория' }}
  q-menu(
    fit cover dark
    max-width="180px"
    anchor="top left"
    ).full-width
    div(:style=`{zIndex: 5000,}`).row.full-width.q-pa-sm
      q-btn(
        v-for="(c,ci) in options" :key="ci"
        v-close-popup
        @click="categoryClick(c.value)"
        flat color="white" dense no-caps
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
      nodeCategories: [],
    }
  },
  computed: {
    options () {
      // return this.nodeCategories
      return this.nodeCategories.reduce((acc, val) => {
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
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
  }
}
</script>
