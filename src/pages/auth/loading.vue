<template lang="pug">
q-page(:style=`{paddingBottom: '200px',}`).row.full-width.justify-center
  div().row.full-width.q-py-xl
    q-spinner(size="50px" color="green")
</template>

<script>
export default {
  name: 'pageAuth_loading',
}
</script>
