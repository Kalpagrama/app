<template lang="pug">
.row.full-width
  q-select(
    filled
    dark color="white"
    :label="$t('Выбери категорию')"
    :value="category(node.category)" @input="categorySelected"
    :options="categories"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      zIndex: 2000, transform: 'translate3d(0,0,0)',
      background: 'none',
    }`).full-width
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
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
