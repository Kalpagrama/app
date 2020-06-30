<template lang="pug">
.column.fit
  div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
    span.text-white.text-bold {{$t('Documents')}}
</template>

<script>
export default {
  name: 'pageApp-settings-docs',
  data () {
    return {
    }
  }
}
</script>
