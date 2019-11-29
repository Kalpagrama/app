<template lang="pug">
.row.fit
  k-menu-desktop(:page="true").full-width
  div(:style=`{position: 'absolute', zIndex: 100, bottom: '0px'}`).row.full-width
    k-menu-mobile
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
