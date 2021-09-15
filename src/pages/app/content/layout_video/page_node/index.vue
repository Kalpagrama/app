<template lang="pug">
div(
  :style=`{
    borderRadius: '10px',
  }`
  ).row.full-width.justify-center.b-30
  div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-start.content-start
    item-feed(
      :itemShortOrFull="node"
      :isActive="true"
      :isVisible="true"
      :showHeader="false"
      :showActions="false"
      :showItems="false")
    .row.full-width.q-pa-md
      q-btn(
        outline no-caps color="grey-8"
        :style=`{
          height: '50px',
        }`
        @click="$emit('pageId', 'nodes')").full-width
        span {{$t('Close')}}
</template>

<script>
export default {
  name: 'pageNode',
  props: ['player', 'contentKalpa', 'node'],
  data () {
    return {
    }
  }
}
</script>
