<style lang="sass" scoped>
.category
  cursor: pointer
  &:hover
    background: rgb(90,90,90)
</style>

<template lang="pug">
div(:style=`{position: 'relative',}`).column.fit
  //- header
  div().row.full-width.q-pa-md
    span(:style=`{fontSize: '16px',}`).text-white.text-bold Pick someting you like
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.justify-center.q-px-md
      div(
        v-for="(c,ci) in categories" :key="ci"
        v-if="c.type !== 'ALL'"
        @click="categoryClick(c,ci)"
        :class=`{
          'bg-green': types.includes(c.type),
        }`
        :style=`{
          height: '52px', borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-mb-xs.q-px-md.category.b-60
        span(:style=`{textTransform: 'capitalize'}`).text-white.text-bold {{ c.name }}
  //- footer
  //- kalpa-debug(:options=`{types}`)
  .row.full-width.q-pa-md
    .col
    q-btn(
      @click="next()"
      round color="green" no-caps
      :disabled="types.length === 0"
      :loading="loading").q-px-md Next
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'editCategories',
  data () {
    return {
      loading: false,
      categories: [],
      types: []
    }
  },
  methods: {
    categoryClick (c, ci) {
      this.$log('categoryClick', c, ci)
      let i = this.types.findIndex(t => t === c.type)
      if (i >= 0) {
        this.types = this.types.filter(t => t !== c.type)
      }
      else {
        this.types.push(c.type)
      }
    },
    async next () {
      this.$log('next')
      this.loading = true
      await this.$wait(1000)
      await UserApi.setFavouriteCategories(this.types)
      this.loading = false
      this.$emit('next')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.categories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
