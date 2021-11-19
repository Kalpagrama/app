<template lang="pug">
.row.full-width.justify-center
  item-feed(
    :itemShortOrFull="item"
    :itemState="{}"
    :isActive="false"
    :isVisible="false"
    :showAuthorAlways="true"
    :showActions="false")
</template>

<script>
export default {
  name: 'blockRender',
  props: ['item']
}
</script>
