<template lang="pug">
.row.full-width.justify-center
  item-feed(
    :itemShortOrFull="item"
    :isActive="false"
    :isVisible="false"
    :showAuthorAlways="true"
    :showActions="false")
</template>

<script>
export default {
  name: 'nodeRender',
  props: ['item']
}
</script>
