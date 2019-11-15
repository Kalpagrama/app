<template lang="pug">
div(:style=`{height: $q.screen.height-60+'px'}`).row.full-width
  k-menu-desktop(:page="true").full-width
</template>

<script>
export default {
  name: 'pageApp__menu',
  props: ['width', 'height'],
  data () {
    return {
    }
  }
 }
</script>
