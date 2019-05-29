<template lang="pug">
.row.fit.items-center.content-start.justify-center
  .row.full-width.justify-center
    q-icon(name="add" size="45px")
  .row.full-width.items-center.justify-center
    q-icon(name="fab fa-vk" size="100px" style="color: #45668e")
  .row.full-width.justify-center
    span(style=`fontSize: 45px`) =
  .row.full-width.items-center.justify-center
    span(style=`fontSize: 100px`) 💘
</template>

<script>
export default {
  name: 'pageLoginVk',
  data () {
    return {
      url: 'https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/VK&scope=email&response_type=code&v=5.92&state=' + window.location.origin
    }
  },
  async mounted () {
    this.$log('mounted')
    await this.$wait(1300)
    location.href = this.url
  }
}
</script>
