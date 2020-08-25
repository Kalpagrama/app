<template lang="pug">
.row.full-width
  div(
    v-for="n in 100" :key="n"
    :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.items-center.content-center.b-50.q-px-md.q-mb-sm
    span.text-white Notification {{ n }}
</template>

<script>
export default {
  name: 'pageApp_notifications_viewHome',
  data () {
    return {
    }
  }
}
</script>
