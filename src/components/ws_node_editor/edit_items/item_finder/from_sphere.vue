<template lang="pug">
q-page(:style=`{minHeight: '100vh'}`).row.full-width
  //- ws-spheres(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`)
  //- iframe(
    src="http://localhost:8282/workspace/spheres"
    :style=`{border: 'none'}`
    ).fit
</template>

<script>
import wsSpheres from 'pages/app/ws_spheres/index.vue'

export default {
  name: 'itemFinder_fromSphere',
  components: {wsSpheres},
}
</script>
