<template lang="pug">
.row.full-width
  div(:style=`{height: height ? height+'px' : '300px'}`).row.full-width
</template>

<script>
export default {
  name: 'kMany',
  props: ['height']
}
</script>
