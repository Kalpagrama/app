<template lang="pug">
.column.fit
  span page/login/vk
</template>

<script>
export default {
  name: 'pageLoginVk',
  data () {
    return {
      url: 'https://oauth.vk.com/authorize?client_id=6911684&display=mobile&redirect_uri=https://api.kalpagramma.com/auth/login/VK&scope=email&response_type=code&v=5.92'
    }
  },
  mounted () {
    this.$log('mounted')
    location.href = this.url
  }
}
</script>
