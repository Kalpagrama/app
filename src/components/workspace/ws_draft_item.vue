<template lang="pug">
div(
  @click="$emit('clicked', item)"
  :style=`{position: 'relative', minHeight: '60px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.bg-white.q-mb-sm
  .row.full-width
    img(v-for="(f, fi) in item.fragments" :key="f.uid"
      :src="f.thumbUrl" :style=`{height: '60px'}`)
    //- .col
  div(:style=`{height: '20px'}`).row.full-width.q-px-sm
    span {{ item.name || item.uid }}
  .row.full-width
    //- small {{ item }}
    //- small {{ item.fragments }}
</template>

<script>
export default {
  name: 'wsDraftItem',
  props: ['item'],
  data () {
    return {
    }
  }
}
</script>
