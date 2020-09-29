<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  q-btn(
    no-caps flat color="grey-5" align="between"
    icon-right="keyboard_arrow_down"
    :style=`{height: '40px'}`
    ).full-width.q-px-sm.b-50 {{ category(node.category) ? category(node.category).label : 'Выбери категорию' }}
    q-menu(
      ref="nodeCategoryMenu"
      fit)
      div(
        :style=`{
          borderRadius: '10px',overflow: 'hidden',}`
        ).row.full-width.items-start.content-start.b-50
        q-btn(
          v-for="n in categories" :key="n.value"
          @click="node.category = n.value, $refs.nodeCategoryMenu.hide()"
          flat color="grey-5" no-caps
          ).full-width {{ n.label }}
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
    categories () {
      return this.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            value: val.type,
            // label: val.alias // val.sphere.name.charAt(0).toUpperCase() + val.sphere.name.slice(1)
            label: val.alias.charAt(0).toUpperCase() + val.alias.slice(1),
          })
        }
        return acc
      }, [])
    }
  },
  methods: {
    category (val) {
      return this.categories.find(c => c.value === val)
    },
    categorySelected (val) {
      this.$log('categorySelected', val)
      this.node.category = val.value
    }
  },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
  }
}
</script>
