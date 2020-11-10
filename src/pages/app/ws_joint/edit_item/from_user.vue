<template lang="pug">
div(
  :style=`{
    position: 'relative',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).column.fit.items-end.content-end
  .col.full-width
    .row.fit.items-center.content-center.justify-center.q-pt-md
      img(
        draggable="false"
        :src="user.thumbUrl"
        :style=`{
          width: isOpened ? '140px' : '44px',
          height: isOpened ? '140px' : '44px',
          borderRadius: '50%',
        }`)
  div(:style=`{height: '60px', textAlign: 'center'}`).row.full-width.items-center.content-center.justify-center
    span(v-if="isOpened").text-white.text-bold {{ user.name }}
    q-icon(v-else name="face" color="white" size="24px")
</template>

<script>
export default {
  name: 'fromUser',
  props: ['user', 'isOpened'],
  data () {
    return {
    }
  }
}
</script>
