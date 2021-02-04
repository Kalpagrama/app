<style lang="sass">
.notification-item
  &:hover
    background: rgb(42,42,42) !important
</style>

<template lang="pug">
.row.full-width
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width
    .row.full-width.items-center.content-center.q-pa-sm
      router-link(
        :to="itemLink(notification.card.items[0])"
        :style=`{
          background: 'rgb(38,38,38)',
          borderRadius: '10px',
        }`
        ).row.items-center.content-center.q-pa-sm.notification-item
        img(
          draggable="false"
          :src="notification.card.items[0].thumbUrl"
          :style=`{
            height: '30px',
            borderRadius: '50%',
          }`)
        .col.q-px-sm
          span.text-grey-5.q-mr-sm {{ notification.card.items[0].name }}
      .col
        .row.full-width.q-px-sm.justify-end
          small.text-grey-8 {{ $date(notification.createdAt) }}
    .row.full-width.q-px-md.q-py-xs
      span(:style=`{textTransform: 'capitalize',}`).text-white {{ notification.card.items[1] }}
    .row.full-width.q-px-sm.q-pa-sm
      router-link(
        :to="itemLink(notification.card.items[2])"
        :style=`{
          background: 'rgb(38,38,38)',
          borderRadius: '10px',
        }`
        ).row.items-center.content-center.q-pa-sm.notification-item
        img(
          draggable="false"
          :src="notification.card.items[2].thumbUrl"
          :style=`{
            height: '30px',
            minWidth: '30px',
            maxWidth: '70px',
            borderRadius: '10px',
          }`)
        .col.q-px-sm
          span.text-grey-5 {{ notification.card.items[2].name }}
</template>

<script>
export default {
  name: 'notificationItem',
  props: ['notification', 'notificationIndex'],
  methods: {
    itemLink (item) {
      let itemMap = {
        NODE: '/node/',
        USER: '/user/',
        WORD: '/sphere/',
        SENTENCE: '/sphere/',
        JOINT: '/joint/',
        VIDEO: '/content/',
        IMAGE: '/content/',
        BOOK: '/content/',
        WEB: '/content/',
      }
      return itemMap[item.type] + item.oid
    }
  }
}
</script>
