<template lang="pug">
div(:style=`{width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white'}`
  ).row.items-center.content-center.justify-center
  //- span.text-white.text-bold K
  q-btn(round flat color="white" icon="blur_on")
</template>

<script>
export default {
  name: 'kalpaSpinner'
}
</script>
